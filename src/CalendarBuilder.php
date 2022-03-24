<?php

namespace Groton\ScheduleZoomRoom;

use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;

class CalendarBuilder
{
    /**
     * @param Vcalendar[] $calendars
     */
    public static function merge(...$calendars) {
        /** @var Vcalendar|null $result */
        $result = null;
        foreach ($calendars as $calendar) {
            /** @var Vcalendar $calendar */
            if (!$result) {
                $result = $calendar;
            } else {
                while ($event = $calendar->getComponent()) {
                    /** @var Vevent $event */
                    $result->setComponent($event, $event->getUid());
                }
            }
        } 
        return $result;
    }
    
    /**
     * @param Vcalendar $calendar
     */
    public static function export($calendar)
    {
        $calendar->setMethod(Vcalendar::PUBLISH);
        $calendar->setXprop(Vcalendar::X_WR_CALNAME, 'Zoom Room Schedule');
        $calendar->setXprop(Vcalendar::X_WR_CALDESC, 'Class meeting schedule for a Zoom Room');
        header('Content-Type: text/calendar');
        echo $calendar->createCalendar();
    }
}