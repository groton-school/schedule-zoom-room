# Schedule Zoom Room

Populate Zoom Room resource calendar in Google from Blackbaud LMS schedule

## Assumptions

- Your classroom assignments are reasonably up-to-date in the Blackbaud LMS
- You are using Google resource calendars to schedule your Zoom Rooms.
- You are using something (e.g. SchoolCal) to sync class schedule information into Google resource calendars.

## Setup

1. In SchoolCal, configure the template for your flow that syncs into your resource calendars to include the section's Blackbaud Group ID. (For example, the value for our `Description` field in the template is `[GroupID={{Section.InternalClassId}}]`.)
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
11. Use clasp to connect the cloned repo to the project and deploy the project into the script:

```sh
clasp clone <project-id>
npm run deploy
```

12. In the script, visit the Triggers <img src="./docs/trigger-icon.png" style="height: 1em; "/> and schedule `syncToResourceCalendars` to run periodically (e.g. every day after SchoolCal updates the resource calendars).

## Maintenance

- At the start of each term, the `Current Year Courses` will need to be updated (again, easy if you're using [Blackbaud-to-Google Lists](https://github.com/groton-school/blackbaud-to-google-lists)). The Group IDs column in `Zoom Rooms` will need to be updated afterwards to incldue any new Group IDs (shown in place of the column header if there are any missing).
- At the start of each term, classes that have resource calendars but no Zoom Room URL will need to be updated manually by visiting their bulletin board (links and the field to update are both in `Zoom Rooms`).

## History

This was [previously](https://github.com/groton-school/schedule-zoom-room/tree/27b08a6529d30751d1af43bad8b0f542044c0596) a _much_ more manual script that facilitated generating ICS files from teacher's schedules to be imported into the Google resource calendars. While there is still a fair bit of manual setup to make this work, the end result is both a) resilient to schedule changes, b) automatically syncing once setup, c) less dependent on the human involved being careful. All good things.
