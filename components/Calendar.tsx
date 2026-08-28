"use client";

import {
  DayHeaderContentArg,
  EventContentArg,
  EventSourceInput,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid"; // a plugin!
import listPlugin from "@fullcalendar/list";

import moment from "moment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function Calendar({
  events,
  startTime,
  endTime,
  initialView,
  lastSelectedCoursePlan,
}: {
  events: EventSourceInput | undefined;
  startTime: string;
  endTime: string;
  initialView: string;
  lastSelectedCoursePlan: Number | undefined;
}) {
  function dayHeaderContent(args: DayHeaderContentArg) {
    return (
      <div className="planner-calendar-day-header">
        <span>{moment(args.date).format("ddd")}</span>
        <strong>{moment(args.date).format("D")}</strong>
      </div>
    );
  }

  function renderEventContent(eventInfo: EventContentArg) {
    const { courseNumber, daColor, instructor, room, subject } =
      eventInfo.event.extendedProps;

    return (
      <div
        className={`planner-calendar-event h-full min-h-0 w-full overflow-hidden rounded-lg px-2 py-1.5 text-white ${daColor}`}
      >
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-tight text-white/85">
          <span className="shrink-0">{eventInfo.timeText}</span>
          {room ? (
            <>
              <span aria-hidden className="text-white/45">
                •
              </span>
              <span className="truncate">{room}</span>
            </>
          ) : null}
        </div>
        <div className="mt-1 truncate text-[13px] font-semibold leading-tight tracking-[-0.01em]">
          <span className="font-bold">
            {subject} {courseNumber}
          </span>
          <span className="font-normal text-white/90">
            {" "}— {eventInfo.event.title}
          </span>
        </div>
        <div className="mt-1 truncate text-[11px] leading-tight text-white/75">
          {instructor?.replace("&#39;", "'")}
        </div>
      </div>
    );
  }

  return (
    <div className="planner-calendar relative h-full w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-950/30">
      {lastSelectedCoursePlan ? (
        <div className="absolute left-3 top-2 z-10">
          <a
            download
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700"
            href={`/api/exportical?id= + ${lastSelectedCoursePlan}`}
          >
            <CalendarMonthIcon fontSize="small" />
            <span>Export</span>
          </a>
        </div>
      ) : null}

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
        nowIndicator
        plugins={[timeGridPlugin, listPlugin]}
        stickyHeaderDates
        buttonText={{
          timeGridWeek: "Week",
          listWeek: "Agenda",
        }}
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
