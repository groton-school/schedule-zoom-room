<?php

use Groton\ScheduleZoomRoom\CalendarBuilder;
use Groton\ScheduleZoomRoom\EventTransform;
use Groton\ScheduleZoomRoom\Extractor;
use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../constants.php';

if(empty($_POST)) {  
    require_once __DIR__ . '/../templates/form.php';
    exit;
} else {
    $schedule = null;
    foreach(array_combine($_POST['blocks'], $_POST['zoom_urls']) as $block => $url) {
        $blockSchedule = Extractor::getMeetings([
            Extractor::CALENDAR_URL => $_POST['schedule_url'],
            Extractor::START_DATE => new DateTime($_POST['start_extract']),
            Extractor::END_DATE => new DateTime($_POST['end_extract']),
            Extractor::FILTERS => [
                Vevent::SUMMARY => "/.* \($block ?.*\)$/"
            ]
        ]);
        $blockSchedule = EventTransform::replaceProperties($blockSchedule, [
            Vevent::LOCATION => $url,
        ]);
        $blockSchedule = EventTransform::resetRecurrence($blockSchedule, [
            Vcalendar::FREQ => Vcalendar::WEEKLY,
            Vcalendar::UNTIL => new DateTime($_POST['stop_schedule'])
        ]);
        if ($schedule) {
            $schedule = CalendarBuilder::merge($schedule, $blockSchedule);
        } else {
            $schedule = $blockSchedule;
        }
    }
    CalendarBuilder::export($schedule);
}