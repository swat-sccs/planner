"use client";

import {
  DayHeaderContentArg,
  EventContentArg,
  EventSourceInput,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!
import listPlugin from "@fullcalendar/list";

import { Card } from "@nextui-org/react";
import moment from "moment";

export default function Calendar({
  events,
  startTime,
  endTime,
  initialView,
}: {
  events: EventSourceInput | undefined;
  startTime: string;
  endTime: string;
  initialView: string;
}) {
  function dayHeaderContent(args: DayHeaderContentArg) {
    return moment(args.date).format("ddd");
  }

  function renderEventContent(eventInfo: EventContentArg) {
    return (
      <Card
        className={`h-16 sm:h-16 lg:h-18 fc-event-main-frame w-[100%] rounded-md group min-h-0 hover:min-h-28 ease-in-out px-1 z-0 hover:z-10 hover:transition-all duration-700 text-white ${eventInfo.event.extendedProps.daColor}`}
      >
        <b className="font-sans text-[10px] font-normal">
          {eventInfo.timeText} {"|"} {eventInfo.event.extendedProps.room}
        </b>
        <div className="font-sans text-[12px] font-bold inline">
          {eventInfo.event.extendedProps.subject}
          {eventInfo.event.extendedProps.courseNumber} :
          <p className="font-normal inline"> {eventInfo.event.title}</p>
        </div>

        <div className="transition-all opacity-0 group-hover:opacity-100 font-sans text-[10px] mt-5 ">
          {eventInfo.event.extendedProps.instructor.replace("&#39;", "'")}
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-primary dark:bg-transparent w-full h-full rounded-lg">
      <FullCalendar
        expandRows
        allDaySlot={false}
        dayHeaderContent={dayHeaderContent}
        editable={false}
        eventContent={renderEventContent}
        events={events}
        headerToolbar={{
          start: "", // will normally be on the left. if RTL, will be on the right
          center: "",
          end: "timeGridWeek,listWeek", // will normally be on the right. if RTL, will be on the left
        }}
        height="100%"
        initialView={initialView}
        plugins={[timeGridPlugin, listPlugin]}
        slotDuration="01:00:00"
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: true,
          meridiem: "short",
        }}
        slotMaxTime={endTime}
        slotMinTime={startTime}
        weekends={false}
      />
    </div>
  );
}
