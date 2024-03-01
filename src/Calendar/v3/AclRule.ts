/**
 * @see https://developers.google.com/calendar/api/v3/reference/acl
 */
type AclRule = {
  kind: 'calendar#aclRule';
  etag: etag;
  id: string;
  scope: {
    type: string;
    value: string;
  };
  role: string;
};

export default AclRule;
