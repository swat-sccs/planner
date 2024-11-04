import * as React from "react";
import { Suspense } from "react";
import { Skeleton } from "@nextui-org/skeleton";

import Search from "../components/Search";
import { FullCourseList } from "../components/FullCourseList";
import CreatePlan from "../components/CreatePlan";
import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import { Course, CoursePlan } from "@prisma/client";
import { getPlanCookie } from "../app/actions";

async function getCourses() {
  const courses = await prisma.course.findMany();
  let output: any = [];

  for (let i = 0; i < courses.length; i++) {
    if (!output.includes(courses[i].year)) {
      output.push(courses[i].year);
    }
  }
  return output;
}

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    term?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const term = searchParams?.term || "";
  var homePageProps: any = {};

  homePageProps["fullCourseList"] = (
    <Suspense
      fallback={
        <Skeleton className="rounded-lg w-8/12 h-full align-top justify-start" />
      }
    >
      <FullCourseList query={query} term={term} />
    </Suspense>
  );

  homePageProps["createPlan"] = (
    <Suspense
      fallback={
        <Skeleton className="rounded-lg w-8/12 h-full align-top justify-start" />
      }
    >
      <CreatePlan />
    </Suspense>
  );

  return <Home {...homePageProps} />; // return with no events
}
async function Home(props: any) {
  const terms = await getCourses();

  return (
    <>
      <div className="grid grid-cols-3 p-4 -mt-10 ">
        <div className="col-span-2 col-start-1">
          <div className="grid grid-rows-subgrid grid-cols-1 gap-5 ">
            <div className="row-start-1">
              <Search terms={terms} />
            </div>
            <div className="row-start-2 h-[62vh] overflow-y-scroll overflow-x-clip">
              {props.fullCourseList}
            </div>
          </div>
        </div>
        <div className="col-start-3">
          <CreatePlan />
        </div>
      </div>
    </>
  );
}
