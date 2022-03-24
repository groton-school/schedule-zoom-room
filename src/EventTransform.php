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
            /** @var Vevent $event */
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
    
    /**
     * @param Vcalendar $calendar
     * @param $rule
     */
    public static function resetRecurrence($calendar, $rule) {
        while ($event = $calendar->getComponent()) {
            /** @var Vevent $event */
            while($event->deleteRrule()) {
                continue;
            }
            $event->setRrule($rule);
            $calendar->setComponent($event, $event->getUid());
        }
        return $calendar;
    }
}