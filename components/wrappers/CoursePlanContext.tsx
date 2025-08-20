"use client";
import { Course } from "@prisma/client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import CreatePlan from "../CreatePlan";
import { Skeleton } from "@nextui-org/react";
import { FullCourseList } from "../FullCourseList";
import Calendar from "../Calendar";
import { getEvents } from "app/actions/getCourses";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCookies } from "next-client-cookies";

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
  const [courses, setCourses] = useState<Course[]>(
    props.initalPlanCourses?.courses
  );
  const [events, setEvents] = useState<Event[]>(props.calEvents);
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const firstLoad = async () => {
    if (props.coursePlans?.length > 0) {
      for (let plan of props.coursePlans) {
        if (props.lastSelectedCoursePlan != null) {
          if (plan.id == parseInt(props.lastSelectedCoursePlan)) {
            setCourses(plan.courses);
          }
        }
      }
    }
  };

  const updateCalEvents = useCallback(
    async (newCourses: Course[]) => {
      let formatCourses = { courses: newCourses };
      let theEvents: Event[] = await getEvents(formatCourses);
      setEvents(theEvents);
      //router.refresh();
    },
    [events]
  );

  useEffect(() => {
    firstLoad();
  }, [props.initialPlan, searchParams]);

  return (
    <>
      {props.courseList ? (
        <div className="col-span-12 lg:col-span-7">
          <div className="lg:h-[88.8vh] h-[60vh]  overflow-y-scroll overflow-x-clip scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
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
          <div className="hidden sm:flex h-[90%] sm:h-[83vh] col-span-12 md:col-span-9 font-sans font-normal flex-col sm:px-5">
            <Calendar
              events={events}
              startTime={props.startTime}
              endTime={props.endTime}
              initialView={"timeGridWeek"}
              lastSelectedCoursePlan={props.lastSelectedCoursePlan}
            />
          </div>
          <div className="flex sm:hidden h-[90%] sm:h-[83vh] col-span-12 md:col-span-9 font-sans font-normal flex-col sm:px-5">
            <Calendar
              events={events}
              startTime={props.startTime}
              endTime={props.endTime}
              initialView={"listWeek"}
              lastSelectedCoursePlan={props.lastSelectedCoursePlan}
            />
          </div>
        </div>
      )}

      <div className="col-span-12 lg:col-span-3 ">
        <CreatePlan
          auth={props.auth}
          updatePlan={(newCourses: any) => {
            setCourses(newCourses);
            if (!props.courseList) {
              updateCalEvents(newCourses);
            }
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
