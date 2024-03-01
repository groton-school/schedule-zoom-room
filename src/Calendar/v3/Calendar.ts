/**
 * @see https://developers.google.com/calendar/api/v3/reference/calendars
 */
type Calendar = {
  kind: 'calendar#calendar';
  etag: etag;
  id: string;
  summary: string;
  description: string;
  location: string;
  timeZone: string;
  conferenceProperties: {
    allowedConferenceSolutionTypes: [string];
  };
};

export default Calendar;
