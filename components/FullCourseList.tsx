"use client";
import { Course, Prisma } from "@prisma/client";

import { useCallback, useEffect, useState } from "react";

import CourseCard from "./CourseCard";
import React from "react";
import { getCourses } from "../app/actions/getCourses";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@nextui-org/react";

const NUMBER_OF_USERS_TO_FETCH = 10;

export function FullCourseList({
  init,
  query,
  term,
  dotw,
  stime,
}: {
  init: Course[];
  query: string;
  term: string;
  dotw: Array<string>;
  stime: Array<string>;
}) {
  const [cursor, setCursor] = useState(1);
  const [take, setTake] = useState(20);
  const [isDone, setIsDone] = useState(false);

  const [courses, setCourses] = useState<Course[]>(init);
  const { ref, inView } = useInView();

  const loadMoreUsers = useCallback(async () => {
    // NOTE: if this isn't done every time we get a double take and a
    // race condition desync, breaking isDone. Maybe we'll have better
    // logic in the future.
    setCursor((cursor) => cursor + NUMBER_OF_USERS_TO_FETCH);
    setTake((take) => take + NUMBER_OF_USERS_TO_FETCH);

    const apiCourses = await getCourses(take, query, term, dotw, stime);
    if (
      inView &&
      (apiCourses.length == 0 || apiCourses.length == courses.length)
    ) {
      console.log("setting isDone true");
      setIsDone(true);
    } else {
      setIsDone(false);
    }
    setCourses(apiCourses);
    // Prevent an infinite loop. TODO: better solution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, term, dotw, stime, inView]);

  useEffect(() => {
    if (inView) {
      loadMoreUsers();
    }
  }, [inView, loadMoreUsers]);

  useEffect(() => {
    setIsDone(false);
    loadMoreUsers();
  }, [query, term, dotw, stime, loadMoreUsers]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {courses?.map((course: any) => (
          <div key={course.id}>
            <CourseCard course={course} />
          </div>
        ))}
        <div ref={ref}>
          {isDone ? (
            <></>
          ) : (
            <Skeleton className="rounded-md w-[98%] h-48 align-top justify-start" />
          )}
        </div>
      </div>
    </>
  );
}
