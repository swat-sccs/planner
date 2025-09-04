import { Faculty, MeetingTime } from "@prisma/client";
// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import moment from "moment";
import ical, {
  ICalCalendarMethod,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from "ical-generator";

function getLaborDay() {
  let targetDate = new Date();
  let targetYear = targetDate.getFullYear();
  let firstDateInMonth = new Date(targetYear, 8, 1);
  let firstWeekdayInMonth = firstDateInMonth.getDay();
  let firstMondayDate = 1 + ((8 - firstWeekdayInMonth) % 7);
  console.log(new Date(targetYear, 8, firstMondayDate, 0, 0, 0, 0));
  return new Date(targetYear, 8, firstMondayDate, 0, 0, 0, 0);
}

function getRealStart(
  meetingTimes: MeetingTime,
  firstDayOfSem: Date,
  classStart: Date
) {
  const startDOTW = firstDayOfSem.getDay();
  let offset = 0;

  if (meetingTimes.sunday) {
    offset = (0 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.monday) {
    offset = (1 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.tuesday) {
    offset = (2 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.wednesday) {
    offset = (3 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.thursday) {
    offset = (4 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.friday) {
    offset = (5 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  } else if (meetingTimes.saturday) {
    offset = (6 - startDOTW + 7) % 7 || 7;
    classStart.setDate(classStart.getDate() + offset);
    return;
  }

  classStart.setDate(classStart.getDate() + offset);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lastSelectedCoursePlan = searchParams.get("id");
  const FIRSTDAYOFWEEK = "Aug 31, 2025";

  let targetYear = new Date().getFullYear();
  let firstDayOfSem = new Date(targetYear, 7, 31, 0, 0, 0, 0);
  let lastDayOfSem = new Date(targetYear, 11, 10, 0, 0, 0, 0);

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
      let repeatArray = [];

      for (const course of coursePlan?.courses) {
        if (
          course.facultyMeet.meetingTimes.beginTime &&
          course.facultyMeet.meetingTimes.endTime
        ) {
          for (const key in course.facultyMeet.meetingTimes) {
            if (key == "monday" && course.facultyMeet.meetingTimes.monday) {
              repeatArray.push(ICalWeekday.MO);
            }
            if (key == "tuesday" && course.facultyMeet.meetingTimes.tuesday) {
              repeatArray.push(ICalWeekday.TU);
            }
            if (
              key == "wednesday" &&
              course.facultyMeet.meetingTimes.wednesday
            ) {
              repeatArray.push(ICalWeekday.WE);
            }
            if (key == "thursday" && course.facultyMeet.meetingTimes.thursday) {
              repeatArray.push(ICalWeekday.TH);
            }
            if (key == "friday" && course.facultyMeet.meetingTimes.friday) {
              repeatArray.push(ICalWeekday.FR);
            }
            if (key == "saturday" && course.facultyMeet.meetingTimes.saturday) {
              repeatArray.push(ICalWeekday.SA);
            }
            if (key == "sunday" && course.facultyMeet.meetingTimes.sunday) {
              repeatArray.push(ICalWeekday.SU);
            }
          }

          let classStart = new Date(
            FIRSTDAYOFWEEK +
              " " +
              course.facultyMeet.meetingTimes.beginTime.substring(0, 2) +
              ":" +
              course.facultyMeet.meetingTimes.beginTime.substring(2) +
              ":00.000"
          );

          getRealStart(
            course.facultyMeet.meetingTimes,
            firstDayOfSem,
            classStart
          );

          let classEnd = new Date(
            FIRSTDAYOFWEEK +
              " " +
              course.facultyMeet.meetingTimes.endTime.substring(0, 2) +
              ":" +
              course.facultyMeet.meetingTimes.endTime.substring(2) +
              ":00.000"
          );

          getRealStart(
            course.facultyMeet.meetingTimes,
            firstDayOfSem,
            classEnd
          );
          const laborDay = getLaborDay();

          calendar
            .createEvent({
              start: classStart,
              end: classEnd,
              summary: course.courseTitle.replace("&amp;", "&"),
              description: course.subject + " " + course.courseNumber,
              location:
                course.facultyMeet.meetingTimes.building +
                " " +
                course.facultyMeet.meetingTimes.room,
            })
            .repeating({
              freq: ICalEventRepeatingFreq.WEEKLY,
              until: lastDayOfSem,
              byDay: repeatArray,
              exclude: [firstDayOfSem, laborDay], // exclude these dates
            })
            .timezone("America/New_York");

          repeatArray = [];
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
