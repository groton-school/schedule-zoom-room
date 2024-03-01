import Event from './Event';

/**
 * @see https://developers.google.com/calendar/api/v3/reference/events/list#response
 */
type Events = {
  kind: 'calendar#events';
  etag: etag;
  summary: string;
  description: string;
  updated: datetime;
  timeZone: string;
  accessRole: string;
  defaultReminders: [
    {
      method: string;
      minutes: integer;
    }
  ];
  nextPageToken: string;
  nextSyncToken: string;
  items: [Event];
};

export default Events;
