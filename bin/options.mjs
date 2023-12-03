export default {
  name: {
    description: "Google Cloud project name",
    default: "Schedule Zoom Room",
  },
  billing: {
    description: "Google Cloud billing account ID for this project",
  },
  delegatedAdmin: {
    description:
      "Google Workspace admin account that will delegate access to Admin SDK API",
  },
  region: {
    description: "Google Cloud region in which to create App Engine instance",
  },
  supportEmail: {
    description: "Support email address for app OAuth consent screen",
  },
  users: {
    description: "Google IDs of users allowed to access app (comma-separated)",
  },
  accessKey: {
    description: "Blackbaud SKY API subscription access key",
    url: "https://developer.blackbaud.com/subscriptions",
  },
  clientId: {
    description: "Blackbaud SKY API app OAuth client ID",
    url: "https://developer.blackbaud.com/apps",
  },
  clientSecret: {
    description: "Blackbaud SKY API app OAuth client secret",
  },
};
