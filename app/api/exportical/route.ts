import { MeetingTime } from "@prisma/client";
// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import ical, {
  ICalCalendarMethod,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from "ical-generator";

/**
 * Get the first occurrence day offset from firstDayOfSem (which is a Monday)
 * Returns the number of days to add to firstDayOfSem to get the first class meeting
 */
function getFirstClassOffset(meetingTimes: MeetingTime): number {
  // First day of semester is Monday
  // Check days in order starting from Monday
  if (meetingTimes.monday) return 0;      // Monday = 0 days offset
  if (meetingTimes.tuesday) return 1;     // Tuesday = 1 day offset
  if (meetingTimes.wednesday) return 2;   // Wednesday = 2 days offset
  if (meetingTimes.thursday) return 3;    // Thursday = 3 days offset
  if (meetingTimes.friday) return 4;      // Friday = 4 days offset
  if (meetingTimes.saturday) return 5;    // Saturday = 5 days offset
  if (meetingTimes.sunday) return 6;      // Sunday = 6 days offset
  
  return 0; // Default to Monday if no days specified
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lastSelectedCoursePlan = searchParams.get("id");

  // Spring 2026 semester dates - first day is Monday, January 19, 2026
  const firstDayOfSem = new Date(2026, 0, 19, 0, 0, 0, 0); // January 19, 2026 (Monday)
  const lastDayOfSem = new Date(2026, 4, 1, 23, 59, 59, 0); // May 1, 2026 (typical spring semester end)

  // Given an incoming request...
  const newHeaders = new Headers();

  if (lastSelectedCoursePlan) {
    const coursePlan = await prisma.coursePlan.findUnique({
      where: {
        id: parseInt(lastSelectedCoursePlan),
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
          const beginHour = parseInt(meetingTimes.beginTime.substring(0, 2), 10);
          const beginMin = parseInt(meetingTimes.beginTime.substring(2), 10);
          const endHour = parseInt(meetingTimes.endTime.substring(0, 2), 10);
          const endMin = parseInt(meetingTimes.endTime.substring(2), 10);

          // Calculate the first occurrence date based on meeting days
          const dayOffset = getFirstClassOffset(meetingTimes);
          
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
              location:
                meetingTimes.building +
                " " +
                meetingTimes.room,
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
        `attachment; filename="${coursePlan?.name}.ics"`
      );
      return new Response(
        new Blob([calendar.toString()], { type: "text/calendar" }),
        {
          status: 200,
          headers: newHeaders,
        }
      );
    }
    return NextResponse.json("Server Error - No Course Plan Number Provided", {
      status: 500,
    });
  }
  return NextResponse.json("Server Error - No Course Plan Number Provided", {
    status: 500,
  });
}
