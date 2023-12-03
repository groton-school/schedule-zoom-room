#!/usr/bin/env node
import gcloud from "@battis/partly-gcloudy";
import cli from "@battis/qui-cli";
import fs from "fs";
import options from "./options.mjs";

async function guideBlackbaudAppCreation({
  url,
  accessKey = undefined,
  clientId = undefined,
  clientSecret = undefined,
}) {
  accessKey = await cli.prompts.input({
    message: `${options.accessKey.description} from ${cli.colors.url(
      options.accessKey.url
    )}`,
    validate: cli.validators.notEmpty,
    default: accessKey,
  });
  await cli.prompts.confirm({
    message: `Create a new app at ${cli.colors.url(options.clientId.url)}`,
  });
  clientId = await cli.prompts.input({
    message: options.clientId.description,
    validate: cli.validators.notEmpty,
    default: clientId,
  });
  clientSecret = await cli.prompts.input({
    message: options.clientSecret.description,
    validate: cli.validators.notEmpty,
    default: clientSecret,
  });
  const redirectUrl = `${url}/redirect`;
  await cli.prompts.confirm({
    message: `Configure ${cli.colors.value(
      redirectUrl
    )} as the app's redirect URL`,
  });
  await cli.prompts.confirm({
    message: `Limit the SKY API scopes as described at ${cli.colors.url(
      "https://github.com/groton-school/blackbaud-to-google-group-sync/blob/main/docs/blackbaud-api-scope.md"
    )}`,
  });
  return { accessKey, clientId, clientSecret, redirectUrl };
}

(async () => {
  const args = gcloud.init({
    args: {
      options,
      flags: {
        deploy: {
          description:
            "Include the (time-consuming) deploy step to App Engine (default true, --no-deploy to skip)",
        },
      },
    },
  });
  if (args.values.verbose) {
    cli.shell.setSilent(false);
  }

  if (gcloud.ready()) {
    const { project, appEngine } = await gcloud.batch.appEnginePublish({
      name: args.values.name,
      id: args.values.project,
      suggestedName: "Schedule Zoom Room",
      billingAccountId: args.values.billing,
      region: args.values.region,
      env: { keys: { urlVar: "URL" } },
      prebuild: () => {
        return true;
      },
      deploy: args.values.deploy,
    });

    // must create an instance so that IAP can be configured
    if (!args.values.built) {
      cli.shell.exec("npm run build");
    }
    if (!args.values.deployed) {
      cli.shell.exec("npm run deploy");
    }

    // enable IAP to limit access to app
    await gcloud.iap.enable({
      applicationTitle: project.name,
      supportEmail: args.values.supportEmail,
      users: args.values.users,
    });

    // guide storage of Blackbaud credentials in Secret Manager, SKY App creation and configuration
    const blackbaud = await guideBlackbaudAppCreation({
      url,
      accessKey: args.values.accessKey,
      clientId: args.values.clientId,
      clientSecret: args.values.clientSecret,
    });
    await gcloud.secrets.set({
      name: "Blackbaud_Subscription_Access_Key",
      value: blackbaud.accessKey,
    });
    await gcloud.secrets.set({ name: "BLACKBAUD_API_TOKEN", value: "null" });
    await gcloud.secrets.set({
      name: "Blackbaud_OAuth2_Client_ID",
      value: blackbaud.clientId,
    });
    await gcloud.secrets.set({
      name: "Blackbaud_OAuth2_Client_Secret",
      value: blackbaud.clientSecret,
    });
    await gcloud.secrets.set({
      name: "Blackbaud_OAuth2_Redirect_URI",
      value: blackbaud.redirectUrl,
    });
    fs.unlinkSync(credentialsPath);
    await gcloud.secrets.enableAppEngineAccess();

    // authorize the app to use Blackbaud SKY API manually
    await cli.prompts.confirm({
      message: `Confirm that you have authorized the app at ${cli.colors.url(
        url
      )}`,
    });
  }
})();
