<?php

namespace Groton\ScheduleZoomRoom;

use Battis\Hydratable\Hydrate;
use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;

class CalendarBuilder
{    
    const CALENDAR = 'calendar';
    const FILENAME = 'filename';
    
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
                while ($event = $calendar->getComponent('vevent')) {
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
    public static function export($params)
    {
        $params = (new Hydrate())($params, [
            self::FILENAME => 'Zoom Room Schedule'
        ]);
        
        $params[self::CALENDAR]->setMethod(Vcalendar::PUBLISH);
        $params[self::CALENDAR]->setXprop(Vcalendar::X_WR_CALNAME, $params[self::FILENAME]);
        $params[self::CALENDAR]->setXprop(Vcalendar::X_WR_CALDESC, 'Class meeting schedule for a Zoom Room');
        header('Content-Type: text/calendar');
        header("Content-Disposition: attachment; filename=\"{$params[self::FILENAME]}.ics\"");
        echo $params[self::CALENDAR]->createCalendar();
    }
}