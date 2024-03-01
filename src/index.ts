import Events from './Calendar/v3/Events';
import Course from './Course';
import g from '@battis/gas-lighter';

const EOL = '\r\n';
const RUN = Utilities.getUuid();

const INITIAL_BACKOFF = 500; //ms
const BACKOFF_FACTOR = 2;
const MAX_ATTEMPTS = 10;

let REQUESTS: GoogleAppsScript.URL_Fetch.URLFetchRequest[] = [];

global.syncToResourceCalendars = () => {
  Logger.log({ message: 'Starting sync', RUN });
  const data = g.SpreadsheetApp.Value.getSheetDisplayValues(
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Zoom Rooms')
  );
  data.shift(); // column titles
  data
    .map((row) => new Course(row))
    .filter((course) => course.calendarId && course.zoomRoomUrl)
    .forEach((course) => {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${course.calendarId}/events?eventTypes=default&timeMin=${course.beginDate}&timeMax=${course.endDate}&q=[GroupID=${course.id}]`;
      let response: GoogleAppsScript.URL_Fetch.HTTPResponse;
      let success = true;
      let attempts = 0;
      let backoff = INITIAL_BACKOFF;
      do {
        attempts++;
        response = UrlFetchApp.fetch(url, {
          headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
          muteHttpExceptions: true
        });
        success = response.getResponseCode() === 200;
        if (
          !success &&
          attempts < MAX_ATTEMPTS &&
          (response.getResponseCode() === 403 ||
            response.getResponseCode() === 429)
        ) {
          Utilities.sleep(backoff);
          backoff *= BACKOFF_FACTOR;
          backoff += Math.random() * 100 - 50;
        }
      } while (!success && attempts < MAX_ATTEMPTS);
      if (attempts > 1) {
        Logger.log({ url, attempts, success });
      }
      const json: Events = JSON.parse(response.getContentText());
      let count = 0;
      if (json.items?.length) {
        json.items.forEach((event) => {
          if (event.description.indexOf(course.zoomRoomUrl) === -1) {
            batch({
              url: `/calendar/v3/calendars/${course.calendarId}/events/${event.id}`,
              method: 'patch',
              payload: {
                description: `${event.description}\n\n${course.zoomRoomUrl}`
              }
            });
            count++;
          }
        });
        batch();
      }
      Logger.log({
        message: `${course.title} / ${course.room}: ${count} events updated`,
        RUN
      });
    });
  Logger.log({ message: 'Ending sync', RUN });
};

function batch(request?: GoogleAppsScript.URL_Fetch.URLFetchRequest) {
  if (request) {
    REQUESTS.push(request);
  }
  if (REQUESTS.length === 50 || (!request && REQUESTS.length > 0)) {
    const boundary = 'batch_item';
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post',
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
        'Content-Type': `multipart/mixed; boundary=${boundary}`
      },
      muteHttpExceptions: true,
      payload:
        `--${boundary}` +
        EOL +
        REQUESTS.map((request) => {
          const payload = JSON.stringify(request.payload);
          return (
            'Content-Type: application/json' +
            EOL +
            `Content-Length: ${payload.length}` +
            EOL +
            `Content-ID: ${request.url.replace(/.*\/(.+)$/, '$1')}` +
            EOL +
            EOL +
            `${(request.method || 'get').toUpperCase()} ${request.url}` +
            EOL +
            EOL +
            payload +
            EOL
          );
        }).join(`--${boundary}` + EOL) +
        EOL +
        `--${boundary}--`
    };
    let success = true;
    let backoff = INITIAL_BACKOFF;
    let attempts = 0;
    do {
      attempts++;
      const response = UrlFetchApp.fetch(
        'https://www.googleapis.com/batch/calendar/v3',
        options
      );
      success = response.getResponseCode() === 200;
      if (
        !success &&
        attempts < MAX_ATTEMPTS &&
        (response.getResponseCode() === 403 ||
          response.getResponseCode() === 429)
      ) {
        Utilities.sleep(backoff);
        backoff *= BACKOFF_FACTOR;
        backoff += Math.random() * 100 - 50;
      }
      REQUESTS = [];
    } while (!success && attempts < MAX_ATTEMPTS);
    if (attempts > 1) {
      Logger.log({ url: request?.url, attempts, success });
    }
  }
}
