<?php

namespace Groton\ScheduleZoomRoom;

use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;

class EventTransform
{
    /**
     * @param Vcalendar $calendar
     * @param $props
     * @return Vevent[]
     */
    public static function replaceProperties($calendar, $props)
    {
        while ($event = $calendar->getComponent()) {
            foreach ($props as $prop => $value) {
                call_user_func_array(
                    [$event, 'set' . ucfirst($prop)],
                    is_array($value) ? $value : [ $value ]
                );
            }
            $calendar->setComponent($event, $event->getUid());
        }
        return $calendar;
    }
}