<?php

use Groton\ScheduleZoomRoom\v0\CalendarBuilder;
use Groton\ScheduleZoomRoom\v0\EventTransform;
use Groton\ScheduleZoomRoom\v0\Extractor;
use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;

require_once __DIR__ . "/../../../vendor/autoload.php";

define("SCHEDULE_URL", "schedule_url");
define("START_EXTRACT", "start_extract");
define("END_EXTRACT", "end_extract");
define("START_SCHEDULE", "start_schedule");
define("END_SCHEDULE", "end_schedule");
define("BLOCKS", "blocks");
define("ZOOM_URLS", "zoom_urls");

// TODO Select a resource calendar and directly insert events
// TODO Query or search by user for Blackbaud calendar?

if (empty($_POST)) {
    require_once __DIR__ . "/../../../public/form.html";
    exit();
} else {
    $schedule = null;
    foreach (
    array_combine($_POST["blocks"], $_POST["zoom_urls"])
    as $block => $url
  ) {
        $blockSchedule = Extractor::getMeetings([
      Extractor::CALENDAR_URL => $_POST["schedule_url"],
      Extractor::START_DATE => new DateTime($_POST["start"]),
      Extractor::END_DATE => new DateTime($_POST["end_extract"]),
      Extractor::FILTERS => [
        Vevent::SUMMARY => "/.* \($block ?.*\)$/",
      ],
    ]);
        $blockSchedule = EventTransform::replaceProperties($blockSchedule, [
      Vevent::LOCATION => $url,
    ]);
        $blockSchedule = EventTransform::resetRecurrence($blockSchedule, [
      Vcalendar::FREQ => Vcalendar::WEEKLY,
      Vcalendar::UNTIL => new DateTime($_POST["end_schedule"]),
    ]);
        if ($schedule) {
            $schedule = CalendarBuilder::merge($schedule, $blockSchedule);
        } else {
            $schedule = $blockSchedule;
        }
    }
    CalendarBuilder::export([
    CalendarBuilder::CALENDAR => $schedule,
    CalendarBuilder::FILENAME => $_POST["calendar_name"],
  ]);
}
