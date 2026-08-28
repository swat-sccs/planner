import { MeetingTime } from "@prisma/client";
// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import ical, {
  ICalCalendarMethod,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from "ical-generator";

function getFirstClassOffset(
  firstDayOfSemester: Date,
  meetingTimes: MeetingTime
) {
  const meetingDays = [
    meetingTimes.sunday,
    meetingTimes.monday,
    meetingTimes.tuesday,
    meetingTimes.wednesday,
    meetingTimes.thursday,
    meetingTimes.friday,
    meetingTimes.saturday,
  ];
  const offsets = meetingDays
    .map((meets, day) =>
      meets ? (day - firstDayOfSemester.getDay() + 7) % 7 : null
    )
    .filter((offset): offset is number => offset !== null);

  return offsets.length > 0 ? Math.min(...offsets) : 0;
}

function parseExportDate(value: string | null, endOfDay = false) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    0
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const planId = Number(searchParams.get("id"));
  const firstDayOfSem = parseExportDate(searchParams.get("start"));
  const lastDayOfSem = parseExportDate(searchParams.get("end"), true);
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Number.isInteger(planId) || planId <= 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!firstDayOfSem || !lastDayOfSem || firstDayOfSem > lastDayOfSem) {
    return NextResponse.json(
      { error: "A valid semester start and end date are required" },
      { status: 400 }
    );
  }

  // Given an incoming request...
  const newHeaders = new Headers();

  if (planId) {
    const coursePlan = await prisma.coursePlan.findFirst({
      where: {
        id: planId,
        User: { uuid: session.user.id },
      },
      include: {
        courses: {
          include: {
            facultyMeet: {
              include: { meetingTimes: true },
            },
          },
        },
      },
    });
    if (coursePlan) {
      const calendar = ical({ name: coursePlan?.name });
      // A method is required for outlook to display event as an invitation
      calendar.method(ICalCalendarMethod.REQUEST);

      for (const course of coursePlan?.courses) {
        if (
          course.facultyMeet.meetingTimes.beginTime &&
          course.facultyMeet.meetingTimes.endTime
        ) {
          const meetingTimes = course.facultyMeet.meetingTimes;
          const repeatArray: ICalWeekday[] = [];

          // Build the repeat days array
          if (meetingTimes.monday) repeatArray.push(ICalWeekday.MO);
          if (meetingTimes.tuesday) repeatArray.push(ICalWeekday.TU);
          if (meetingTimes.wednesday) repeatArray.push(ICalWeekday.WE);
          if (meetingTimes.thursday) repeatArray.push(ICalWeekday.TH);
          if (meetingTimes.friday) repeatArray.push(ICalWeekday.FR);
          if (meetingTimes.saturday) repeatArray.push(ICalWeekday.SA);
          if (meetingTimes.sunday) repeatArray.push(ICalWeekday.SU);

          // Parse the time strings (format: "HHMM" like "0930" or "1445")
          const beginHour = parseInt(
            meetingTimes.beginTime.substring(0, 2),
            10
          );
          const beginMin = parseInt(meetingTimes.beginTime.substring(2), 10);
          const endHour = parseInt(meetingTimes.endTime.substring(0, 2), 10);
          const endMin = parseInt(meetingTimes.endTime.substring(2), 10);

          // Calculate the first occurrence date based on meeting days
          const dayOffset = getFirstClassOffset(firstDayOfSem, meetingTimes);

          // Create the start date: first day of semester + offset to first meeting day
          const classStart = new Date(firstDayOfSem);
          classStart.setDate(classStart.getDate() + dayOffset);
          classStart.setHours(beginHour, beginMin, 0, 0);

          // Create the end date: same day as start, but with end time
          const classEnd = new Date(classStart);
          classEnd.setHours(endHour, endMin, 0, 0);

          calendar
            .createEvent({
              start: classStart,
              end: classEnd,
              summary: course.courseTitle.replace("&amp;", "&"),
              description: course.subject + " " + course.courseNumber,
              location: meetingTimes.building + " " + meetingTimes.room,
            })
            .repeating({
              freq: ICalEventRepeatingFreq.WEEKLY,
              until: lastDayOfSem,
              byDay: repeatArray,
            })
            .timezone("America/New_York");
        }
      }

      // Add a new header
      newHeaders.set("Content-Type", "text/calendar; charset=utf-8");
      newHeaders.set(
        "Content-Disposition",
        `attachment; filename="${coursePlan.name.replace(/[\r\n"\\/]/g, "_")}.ics"`
      );
      return new Response(
        new Blob([calendar.toString()], { type: "text/calendar" }),
        {
          status: 200,
          headers: newHeaders,
        }
      );
    }
    return NextResponse.json("Course plan not found", {
      status: 404,
    });
  }
  return NextResponse.json("Invalid course plan", {
    status: 400,
  });
}
