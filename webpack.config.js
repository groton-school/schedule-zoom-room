module.exports = require("@battis/webpack/ts/spa")({
  root: __dirname,
  appName: "Schedule Zoom Room",
  entry: "./src/client/index.ts",
  template: "template",
  build: "public",
});
