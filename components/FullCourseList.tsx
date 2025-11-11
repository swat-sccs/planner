"use client";
import { Course } from "@prisma/client";

import { useCallback, useEffect, useState } from "react";

import CourseCard from "./CourseCard";
import React from "react";
import {
  getCourses,
  getCourseIds,
  updateDBPlan,
  getPlanCourses,
} from "../app/actions/getCourses";
import { useInView } from "react-intersection-observer";
import { Card, CardBody, CardHeader, Skeleton } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import CourseCardAdded from "./CourseCardAdded";
import {
  getSelectedCoursesCookie,
  setSelectedCookie,
} from "app/actions/actions";
import { tv } from "tailwind-variants";

const NUMBER_OF_USERS_TO_FETCH = 10;

export function FullCourseList({
  init,
  query,
  term,
  dotw,
  stime,
  excludeDays,
  excludeTime,
  selectedCourses,
  updatePlan,
  auth,
}: {
  init: Course[];
  query: string;
  term: string;
  dotw: Array<string>;
  stime: Array<string>;
  excludeDays?: boolean;
  excludeTime?: boolean;
  selectedCourses: Course[] | null;
  updatePlan: any;
  auth: any;
}) {
  const router = useRouter();

  const [cursor, setCursor] = useState(1);
  const [take, setTake] = useState(20);
  const [isDone, setIsDone] = useState(false);

  //const [selectedCourses, setSelectedCourses]: any = useState([]);
  const [selectedCourseIDS, setSelectedCourseIDS]: any = useState([]);
  const [courses, setCourses] = useState<Course[]>(init);
  const { ref, inView } = useInView();

  const loadMoreCourses = useCallback(async () => {
    // NOTE: if this isn't done every time we get a double take and a
    // race condition desync, breaking isDone. Maybe we'll have better
    // logic in the future.

    setCursor((cursor) => cursor + NUMBER_OF_USERS_TO_FETCH);
    setTake((take) => take + NUMBER_OF_USERS_TO_FETCH);
    //console.log(take, query, term);
    const apiCourses = await getCourses(take, query, term, dotw, stime, excludeDays, excludeTime);

    if (inView) {
      if (apiCourses.length == 0 || apiCourses.length == courses?.length) {
        setIsDone(true);
      } else {
        setIsDone(false);
      }
    }

    /*
    if (
      inView &&
      (apiCourses.length == 0 || apiCourses.length == courses?.length)
    ) {
      console.log("setting isDone true");
      console.log(apiCourses.length);
      console.log(courses?.length);
      setIsDone(true);
    } else {
      setIsDone(false);
    }*/
    setCourses(apiCourses);

    // Prevent an infinite loop. TODO: better solution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, term, dotw, stime, excludeDays, excludeTime, inView]);

  async function loadCourseIds(course?: any) {
    if (selectedCourses) {
      if (course && !selectedCourses?.some((e) => e.id == course.id)) {
        const theCourses = Array.from(selectedCourses);
        theCourses.push(course);
        updatePlan(theCourses);
        selectedCourses = theCourses;

        updateDBPlan(course).catch((thing) => {
          //something went wrong then get current db state and update with that
          const planCourses: any = getPlanCourses();
          if (planCourses) {
            updatePlan(planCourses?.courses);
          }
        });
      }
      let ids: any = [];
      for (let course of selectedCourses) {
        ids.push(course.id);
      }
      setSelectedCourseIDS(ids);
    }
  }

  useEffect(() => {
    if (inView) {
      loadMoreCourses();
      loadCourseIds();
    }
  }, [inView, loadMoreCourses]);

  useEffect(() => {
    //setIsDone(false);
    loadMoreCourses();
    loadCourseIds();
  }, [query, term, dotw, stime, excludeDays, excludeTime, loadMoreCourses]);

  const card = tv({
    slots: {
      base: "hover:cursor-pointer bg-light_foreground min-h-32 max-h-62 w-[98%] rounded-md scroll-none drop-shadow-lg transition-colors",
      role: "font-bold text-primary ",
    },
  });

  const { base, role } = card();

  return (
    <>
      <div className="flex flex-col gap-3 ">
        {courses?.map((course: any) => (
          <div key={course.id} onClick={() => loadCourseIds(course)}>
            <CourseCard
              courses={courses}
              course={course}
              added={auth ? selectedCourseIDS?.includes(course.id) : false}
              updatePlan={(newCourses: Course[]) => updatePlan(newCourses)}
            />
          </div>
        ))}
        {courses?.length == 0 ? (
          <Card isHoverable className={base()} shadow="sm">
            <CardHeader className="pl-6 text-3xl">
              Oops! Looks like that class does not exist!
            </CardHeader>

            <CardBody className="pt-0 pl-6 ">
              Please try refining your search. You can search for any of the
              following:
              <ul className="ml-5">
                <li>Course Name</li>
                <li>Instructor Name</li>
                <li>Course Department Code/Number (ex. CPSC 035)</li>
                <li>Course Tags: (w), SS, NSE</li>
              </ul>
            </CardBody>
          </Card>
        ) : null}

        <div>
          {isDone ? (
            <></>
          ) : (
            <Skeleton
              ref={ref}
              className="rounded-md w-[98%] h-48 align-top justify-start"
            />
          )}
        </div>
      </div>
    </>
  );
}
