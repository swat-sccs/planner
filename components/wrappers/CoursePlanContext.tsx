"use client";
import { Course } from "@prisma/client";
import { Suspense, useCallback, useEffect, useState } from "react";
import CreatePlan from "../CreatePlan";
import { Card, Skeleton } from "@nextui-org/react";
import { FullCourseList } from "../FullCourseList";
import Calendar from "../Calendar";
import { getEvents } from "app/actions/getCourses";
import { useRouter } from "next/navigation";
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

export default function CoursePlanContext(props: any) {
  const router = useRouter();
  const [courses, setCourses] = useState<any>(props.initalPlanCourses?.courses);
  const [events, setEvents] = useState<Event[]>(props.calEvents);

  const firstLoad = useCallback(() => {
    if (props.coursePlans?.length > 0) {
      for (let plan of props.coursePlans) {
        if (plan.id == parseInt(props.lastSelectedCoursePlan)) {
          setCourses(plan.courses);
        }
      }
    }
  }, [props.coursePlans, courses, props.initalPlanCourses]);

  const updateCalEvents = useCallback(
    async (newCourses: Course[]) => {
      let formatCourses = { courses: newCourses };
      console.log("hi", formatCourses);
      let theEvents: Event[] = await getEvents(formatCourses);
      setEvents(theEvents);
      //router.refresh();
    },
    [events]
  );
  /*
  async function updateCalEvents(newCourses: Course[]) {
    let formatCourses = { courses: newCourses };
    console.log("hi", formatCourses);
    let theEvents: Event[] = await getEvents(formatCourses);
    setEvents(theEvents);
    router.refresh();
  }
    */
  useEffect(() => {
    firstLoad();
  }, [props.initialPlan]);

  return (
    <>
      {props.courseList ? (
        <div className="col-span-12 lg:col-span-7">
          <div className="h-[84vh] overflow-y-scroll overflow-x-clip scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
            <Suspense
              fallback={
                <div className="grid gap-3">
                  <Skeleton className="rounded-md w-[98%] h-48 align-top justify-start" />
                  <Skeleton className="rounded-md w-[98%] h-48 align-top justify-start" />
                  <Skeleton className="rounded-md w-[98%] h-48 align-top justify-start" />
                </div>
              }
            >
              <FullCourseList
                init={props.initialCourses}
                auth={props.auth}
                dotw={props.dotw}
                query={props.query}
                stime={props.stime}
                term={props.term}
                selectedCourses={props.auth ? courses : null}
                updatePlan={(newCourses: Course[]) => setCourses(newCourses)}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="col-span-12 lg:col-span-9">
          <div className="h-[100%] sm:h-[83vh] col-span-12 md:col-span-9 font-sans font-normal flex-col sm:px-5">
            <Calendar
              events={events}
              startTime={props.startTime}
              endTime={props.endTime}
            />
          </div>
        </div>
      )}

      <div className="col-span-12 lg:col-span-3 ">
        <CreatePlan
          auth={props.auth}
          updatePlan={(newCourses: any) => {
            setCourses(newCourses);
            updateCalEvents(newCourses);
            //props.refreshEvents();
          }}
          courses={courses}
          initialPlan={props.initalPlanCourses}
          coursePlans={props.coursePlans}
          lastSelectedCoursePlan={props.lastSelectedCoursePlan}
        />
      </div>
    </>
  );
}

/*
function Panel({ title, children, isActive, onShow }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {isActive ? <p>{children}</p> : <button onClick={onShow}>Show</button>}
    </section>
  );
}
  */
