/**
 * @see https://developers.google.com/calendar/api/v3/reference/colors
 */
type Colors = {
  kind: 'calendar#colors';
  updated: datetime;
  calendar: {
    (key): {
      background: string;
      foreground: string;
    };
  };
  event: {
    (key): {
      background: string;
      foreground: string;
    };
  };
};

export default Colors;
