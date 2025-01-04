// a plugin!

import CreatePlan from "../../components/CreatePlan";
import Calendar from "../../components/Calendar";
import prisma from "../../lib/prisma";
import { getPlanCookie } from "../actions/actions";
import { generateColorFromName } from "../../components/primitives";
import { getCoursePlans, getPlanCourses1 } from "app/actions/getCourses";

interface Event {
  classNames: string;
  textColor: string;
  title: string;
  daColor: string;
  subject: string;
  courseNumber: string;
  instructor: string;
  room: string;
  color: string;
  borderWidth: string;
  daysOfWeek: (false | "0" | "1" | "2" | "3" | "4" | "5" | "6" | undefined)[];
  startTime: string;
  endTime: string;
}

async function getEvents(): Promise<Event[]> {
  "use server";
  const output: Event[] = [];
  const planCookie: any = await getPlanCookie();

  let courses;

  if (planCookie) {
    const plan = await prisma.coursePlan.findUnique({
      where: {
        id: parseInt(planCookie),
      },
      include: {
        courses: {
          include: {
            instructor: true,
            facultyMeet: {
              include: {
                meetingTimes: true,
              },
            },
          },
        },
      },
    });

    courses = plan?.courses;
  }

  if (courses) {
    for (let i = 0; i < courses.length; i++) {
      const color = generateColorFromName(courses[i].subject);

      const num: string = courses[i].courseReferenceNumber;
      const meetingTimes = await prisma.meetingTime.findFirst({
        where: {
          courseReferenceNumber: num,
        },
      });

      output.push({
        classNames: "font-sans",
        textColor: "white",
        title: courses[i]?.courseTitle,
        daColor: color,
        subject: courses[i]?.subject,
        courseNumber: courses[i]?.courseNumber,
        instructor: courses[i]?.instructor.displayName,
        room:
          courses[i]?.facultyMeet.meetingTimes.building +
          " " +
          courses[i]?.facultyMeet.meetingTimes.room,
        color: "rgba(0,0,0,0)",

        borderWidth: "0px",
        daysOfWeek: [
          meetingTimes?.sunday && "0",
          meetingTimes?.monday && "1",
          meetingTimes?.tuesday && "2",
          meetingTimes?.wednesday && "3",
          meetingTimes?.thursday && "4",
          meetingTimes?.friday && "5",
          meetingTimes?.saturday && "6",
        ],

        startTime:
          meetingTimes?.beginTime.slice(0, 2) +
          ":" +
          meetingTimes?.beginTime.slice(2),
        endTime:
          meetingTimes?.endTime.slice(0, 2) +
          ":" +
          meetingTimes?.endTime.slice(2),
      });
    }
  }

  return output;
}

export default async function CalendarPage() {
  const events: Event[] = await getEvents();
  const planCourses: any = await getPlanCourses1();
  const coursePlans: any = await getCoursePlans();

  let endTime = "17:00";
  let startTime = "09:00";

  for (const event of events) {
    if (event.startTime < startTime && event.startTime != ":")
      startTime = event.startTime;
    if (event.endTime > endTime && event.endTime != ":")
      endTime = event.endTime;
  }

  //let times = await getUniqueStartEndTimes();
  return (
    <div className="grid grid-cols-12 grid-rows-2 sm:grid-rows-1 p-3 lg:p-4 gap-5">
      <div className="sm:h-[83vh] col-span-12 md:col-span-9 font-sans font-normal flex-col sm:px-5">
        <Calendar events={events} startTime={startTime} endTime={endTime} />
      </div>
      <div className="sm:h-[83vh] col-span-12 md:col-span-3 ">
        <CreatePlan initialPlan={planCourses} coursePlans={coursePlans} />
      </div>
    </div>
  );
}
