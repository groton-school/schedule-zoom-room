<?php

namespace Groton\ScheduleZoomRoom;

use Battis\Hydratable\Hydrate;
use DateTime;
use Kigkonsult\Icalcreator\Vcalendar;
use Kigkonsult\Icalcreator\Vevent;
use Kigkonsult\Icalcreator\Vtimezone;

class Extractor
{
    public const CALENDAR_URL = 'calendar_url';
    public const START_DATE = 'start_date';
    public const END_DATE = 'end_date';
    public const UNIQUE_ID = 'unique_id';
    public const FILTERS = 'filters';

    public static function getMeetings($params)
    {
        $params = (new Hydrate())($params, [
            self::START_DATE => new DateTime('monday this week'),
            self::END_DATE => (new DateTime($params[self::START_DATE] instanceof DateTime ? $params[self::START_DATE]->format('c') : 'monday this week'))->modify('+6 days'),
            self::UNIQUE_ID => 'groton/schedule-zoom-room:' . (new DateTime())->format('c'),
            self::FILTERS => [
                'SUMMARY' => '/(.*) \((RD|OR|YE|GR|LB|DB|PR|[WXYZ]+) ?.*\)$/'
           ]
        ]);

        $params[self::CALENDAR_URL] = preg_replace('/^webcal(s?):\/\/(.*)/i', 'http$1://$2', $params[self::CALENDAR_URL]);

        // FIXME crashes on invalid URL
        $parser = new Vcalendar([Vcalendar::UNIQUE_ID => $params[self::UNIQUE_ID]]);
        $calendar = $parser->parse(file_get_contents($params[self::CALENDAR_URL]));
        $events = $calendar->selectComponents($params[self::START_DATE], $params[self::END_DATE], null, null, null, null, 'vevent', true, true, false);

        $selection = new Vcalendar([Vcalendar::UNIQUE_ID => $params[self::UNIQUE_ID]]);
        while ($timezone = $calendar->getComponent('vtimezone')) {
            /** @var Vtimezone $timezone */
            $selection->setComponent($timezone, md5(print_r($timezone, true)));
        }


        foreach($events as $event) {
            /** @var Vevent $event */
            $include = true;
            foreach($params[self::FILTERS] as $prop => $regex) {
                $include = $include && preg_match($regex, $event->getSummary());
            }
            if ($include) {
                $selection->setComponent($event, $event->getUid());
            }
        }
        return $selection;
    }
}
