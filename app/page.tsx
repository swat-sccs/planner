import * as React from "react";
import { Suspense } from "react";
import { Skeleton } from "@nextui-org/skeleton";

import { cookies } from "next/headers";
import Search from "../components/Search";
import { FullCourseList } from "../components/FullCourseList";
import Filters from "../components/Filters";
import CreatePlan from "../components/CreatePlan";
import {
  getInitialCourses,
  getPlanCourses,
  getTerms,
  getUniqueStartEndTimes,
  getUniqueCodes,
  getCoursePlans,
} from "../app/actions/getCourses";

import { getSelectedCoursePlan } from "./actions/userActions";
import { redirect } from "next/navigation";
import CoursePlanContext from "../components/wrappers/CoursePlanContext";
import { auth } from "@/lib/auth";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    term?: string;
    prof?: string;
    dotw?: Array<string>;
    stime?: Array<string>;
  }>;
}) {
  const cookieStore = await cookies();
  const planID = await cookieStore.get("plan");
  const pagePref = cookieStore.get("pagePref");
  const session = await auth();

  if (pagePref && pagePref.value != "/") {
    redirect(pagePref.value);
  }

  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const term = searchParams?.term || "";
  const dotw = searchParams?.dotw || [];
  const stime = searchParams?.stime || [];
  const profQuery = searchParams?.prof || "";
  const homePageProps: any = {};

  let initalCourses;
  let planCourses;
  let coursePlans;
  let lastSelectedCoursePlan;

  if (session?.user) {
    initalCourses = await getInitialCourses(query, term, dotw, stime);
    planCourses = await getPlanCourses();
    coursePlans = await getCoursePlans();
    lastSelectedCoursePlan = await getSelectedCoursePlan(session);
  }
  homePageProps["courseWrapper"] = (
    <Suspense
      fallback={
        <Skeleton className="rounded-lg w-8/12 h-fit align-top justify-start" />
      }
    >
      <CoursePlanContext
        auth={session?.user}
        initialCourses={initalCourses}
        dotw={dotw}
        query={query}
        stime={stime}
        term={term}
        initalPlanCourses={planCourses}
        coursePlans={coursePlans}
        lastSelectedCoursePlan={lastSelectedCoursePlan}
        courseList={true}
      />
    </Suspense>
  );

  /*
  homePageProps["fullCourseList"] = (
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
        init={initalCourses}
        dotw={dotw}
        query={query}
        stime={stime}
        term={term}
      />
    </Suspense>
  );
  */
  /*
  homePageProps["createPlan"] = (
    <Suspense
      fallback={
        <Skeleton className="rounded-lg w-8/12 h-fit align-top justify-start" />
      }
    >
      <CreatePlan initialPlan={planCourses} coursePlans={coursePlans} />
    </Suspense>
  );
  */

  return <Home {...homePageProps} />; // return with no events
}
async function Home(props: any) {
  const terms = await getTerms();
  const uniqueTimes = await getUniqueStartEndTimes();
  const codes = await getUniqueCodes();

  return (
    <>
      <div className="grid grid-cols-12 p-3 lg:p-4 lg:py-0 h-full lg:h-[88.8vh] gap-5">
        <div className=" lg:col-span-2 lg:flex hidden">
          <Suspense
            fallback={
              <Skeleton className="rounded-lg w-8/12 h-fit align-top justify-start" />
            }
          >
            <Filters
              className=""
              codes={codes}
              terms={terms}
              times={uniqueTimes}
            />
          </Suspense>
        </div>

        <div className="col-span-12  lg:hidden w-[98%]">
          <Search />
        </div>
        {props.courseWrapper}
      </div>
    </>
  );
}
