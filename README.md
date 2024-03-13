# Schedule Zoom Room

Populate Zoom Room resource calendar in Google from Blackbaud LMS schedule

## Assumptions

- Your classroom assignments are reasonably up-to-date in the Blackbaud LMS
- You are using Google resource calendars to schedule your Zoom Rooms.
- You are using something (e.g. SchoolCal) to sync class schedule information into Google resource calendars.
- You are accessing the Blackbaud LMS with sufficient privileges to create advanced lists, see courses, etc.
- You are creating the `Schedule Zoom Rooms` sheet and script with a Google user with sufficient permissions to be able to update all of the affected resource calendars.

## Setup

1. In SchoolCal, configure the template for your flow that syncs into your resource calendars to include the section's Blackbaud Group ID. (For example, the value for our `Description` field in the template is

   ```mustache
   [GroupID={{Section.InternalClassId}}]
   ```

2. Define the [Current Year Courses](./schema/Current%20Year%20Courses) advanced list in the Blackbaud LMS.
3. Create the [Schedule Zoom Rooms](./schema/Schedule%20Zoom%20Rooms.xlsx) sheet in Google Sheets.
4. Import the advanced list into the `Current Year Courses` worksheet in the sheet. (Easiest way is to use [Blackbaud-to-Google Lists](https://github.com/groton-school/blackbaud-to-google-lists).)
5. Populate the `Resource Calendars` sheet. (Easiest way is to call the Google Calendar API: `GET https://www.googleapis.com/calendar/v3/users/me/calendarList` as a user subscribed to all the relevant resource calendars).
6. Copy the relevant/desired/all group IDs into the `Group ID` column of the `Zoom Rooms` worksheet (this is manual to preserve the linkage between Group ID and Zoom Room URL).
7. Manually click through the bulletin boards of each course that has an associated resource claendar on the `Zoom Rooms` sheet and copy-and-paste in the courses Zoom Room URL.
8. Clone this repository and install dependencies:

   ```sh
   git clone git@github.com:groton-school/schedule-zoom-room.git
   cd schedule-zoom-room
   npm install
   ```

9. In the sheet, in the `Extensions` menu, open the `Apps Script`.
10. Copy the project ID of the script: `https://script.google.com/u/0/home/projects/<project ID>/edit`
11. Use [`clasp`](https://developers.google.com/apps-script/guides/clasp) (included as a script dependency) to connect the cloned repo to the project and deploy the project into the script:

    ```sh
    npx clasp clone <project-id>
    npm run deploy
    ```

12. In the [Google Cloud console](https://console.cloud.google.com), create a new project.

    1. Set up the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent). The only scope you need to add is `https://www.googleapis.com/auth/calendar`
    2. Enable the [Google Calendar API](https://console.cloud.google.com/apis/api/calendar-json.googleapis.com/)
    3. Copy the project number from the [Project Dashboard](https://console.cloud.google.com/home/dashboard).

13. In the script, visit the Project Settings <img src="./docs/settings-icon.png" style="height: 1em" /> and change the project from the default to the project number you copied from the Google Cloud Project.
14. Switch to the Editor <img src="./docs/editor-icon.png" style="height: 1em" /> and run `syncToResourceCalendars`. Give the script access to all the scopes that it requests.

    - `https://www.googleapis.com/auth/calendar` so that the script's OAuth token will have sufficient scope to list and update calendar events (in the resource calendars).
    - `https://www.googleapis.com/auth/spreadsheets` to access the spreadsheet of data (to which the script is attached)
    - `https://www.googleapis.com/auth/script.external_request` so the script can make external requests to the Google Calendar API (because it batches the requests, it needs to use `UrlFetchApp` rather than the built-in `CalendarApp` API).

15. Switch to the Triggers <img src="./docs/trigger-icon.png" style="height: 1em; "/> and schedule `syncToResourceCalendars` to run periodically (e.g. every day after SchoolCal updates the resource calendars).

## Maintenance

- At the start of each term, the `Current Year Courses` will need to be updated (again, easy if you're using [Blackbaud-to-Google Lists](https://github.com/groton-school/blackbaud-to-google-lists)). The Group IDs column in `Zoom Rooms` will need to be updated afterwards to include any new Group IDs (shown in place of the column header if there are any missing).
- At the start of each term, classes that have resource calendars but no Zoom Room URL will need to be updated manually by visiting their bulletin board (links and the field to update are both in `Zoom Rooms`).

## History

This was [previously](https://github.com/groton-school/schedule-zoom-room/tree/27b08a6529d30751d1af43bad8b0f542044c0596) a _much_ more manual script that facilitated generating ICS files from teacher's schedules to be imported into the Google resource calendars. While there is still a fair bit of manual setup to make this work, the end result is both a) resilient to schedule changes, b) automatically syncing once setup, c) less dependent on the human involved being careful. All good things.

- The [`heroku`](https://github.com/groton-school/schedule-zoom-room/tree/heroku) branch is the initial version, designed to run on Heroku as a PHP-processed form.
- The [`google-app-engine`](https://github.com/groton-school/schedule-zoom-room/tree/google-app-engine) branch is a conversion and continuing development of the `heroku` branch, designed to run as a PHP-processed form on Google App Engine.

Current development in the `main` branch is in Typescript, compiled by `clasp` into Google Apps Script attached to a Google Sheet.
