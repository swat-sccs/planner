"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Course } from "@prisma/client";
import { Button, Card, CardBody, Chip, Skeleton } from "@nextui-org/react";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { useInView } from "react-intersection-observer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getCourses, getPlanCourses, updateDBPlan } from "@/actions/getCourses";
import { announceCourseAdded } from "@/lib/courseAddedEvent";
import CourseCard from "./CourseCard";

type CoursePage = {
  courses: Course[];
  nextCursor: number | null;
  totalCount: number | null;
};

export function FullCourseList({
  init,
  query,
  term,
  dotw,
  stime,
  distributions,
  selectedCourses,
  updatePlan,
  auth,
}: {
  init: CoursePage;
  query: string;
  term: string;
  dotw: string[];
  stime: string[];
  distributions: string[];
  selectedCourses: Course[] | null;
  updatePlan: (courses: Course[]) => void;
  auth: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPage = Array.isArray(init)
    ? { courses: init, nextCursor: null, totalCount: init.length }
    : init;
  const [courses, setCourses] = useState<Course[]>(initialPage.courses);
  const [nextCursor, setNextCursor] = useState<number | null>(
    initialPage.nextCursor
  );
  const [totalCount, setTotalCount] = useState<number>(
    initialPage.totalCount ?? initialPage.courses.length
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const { ref, inView } = useInView({ rootMargin: "240px" });

  useEffect(() => {
    const page = Array.isArray(init)
      ? { courses: init, nextCursor: null, totalCount: init.length }
      : init;
    setCourses(page.courses);
    setNextCursor(page.nextCursor);
    setTotalCount(page.totalCount ?? page.courses.length);
    setIsLoadingMore(false);
  }, [init]);

  useEffect(() => {
    setSelectedCourseIds(selectedCourses?.map((course) => course.id) || []);
  }, [selectedCourses]);

  const loadMoreCourses = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = await getCourses(
        nextCursor,
        query,
        term,
        dotw,
        stime,
        distributions
      );

      setCourses((current) => {
        const uniqueCourses = new Map(
          current.map((course) => [course.id, course])
        );
        for (const course of nextPage.courses)
          uniqueCourses.set(course.id, course);
        return Array.from(uniqueCourses.values());
      });
      setNextCursor(nextPage.nextCursor);
    } catch (error) {
      console.error("Unable to load more courses", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, query, term, dotw, stime, distributions]);

  useEffect(() => {
    if (inView) loadMoreCourses();
  }, [inView, loadMoreCourses]);

  async function addCourse(course: Course) {
    if (!selectedCourses || selectedCourseIds.includes(course.id)) return;

    const updatedCourses = [...selectedCourses, course];
    setSelectedCourseIds((current) => [...current, course.id]);
    updatePlan(updatedCourses);

    try {
      const updatedPlan = await updateDBPlan(course);
      if (updatedPlan) announceCourseAdded();
    } catch (error) {
      console.error("Unable to add course to plan", error);
      const currentPlan: any = await getPlanCourses();
      updatePlan(currentPlan?.courses || []);
    }
  }

  const activeFilterCount = dotw.length + stime.length + distributions.length;
  const resultLabel = `${totalCount.toLocaleString()} ${
    totalCount === 1 ? "course" : "courses"
  }`;

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("dotw");
    params.delete("stime");
    params.delete("dist");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex min-h-full flex-col gap-3 pr-1">
      <div className="sticky top-0 z-20 flex flex-col gap-3 rounded-xl border border-default-200 bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-bold text-foreground">
              Course results
            </h1>
            <Chip size="sm" variant="flat">
              {resultLabel}
            </Chip>
          </div>
          <p className="mt-0.5 truncate text-xs text-default-500">
            {query
              ? `Results for “${query}”`
              : term
                ? `Browsing ${term.replace(/^F/, "Fall ").replace(/^S/, "Spring ")}`
                : "Browse the current course catalog"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Chip
            size="sm"
            startContent={
              <TuneRoundedIcon className="ml-0.5" fontSize="small" />
            }
            variant={activeFilterCount > 0 ? "flat" : "bordered"}
          >
            {activeFilterCount} active
          </Chip>
          {activeFilterCount > 0 ? (
            <Button
              size="sm"
              startContent={<ClearAllRoundedIcon fontSize="small" />}
              variant="light"
              onPress={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {courses.map((course: any) => (
            <CourseCard
              added={auth ? selectedCourseIds.includes(course.id) : false}
              course={course}
              courses={courses}
              key={course.id}
              loadCourseIds={addCourse}
            />
          ))}
        </div>
      ) : (
        <Card className="border border-default-200 bg-content1/80 shadow-sm">
          <CardBody className="grid min-h-64 place-items-center px-6 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <SearchOffRoundedIcon />
              </div>
              <h2 className="mt-4 text-lg font-bold text-foreground">
                No courses found
              </h2>
              <p className="mt-1 text-sm leading-6 text-default-500">
                Try a broader search or clear a few filters to see more of the
                catalog.
              </p>
              {activeFilterCount > 0 ? (
                <Button
                  className="mt-4"
                  color="primary"
                  startContent={<ClearAllRoundedIcon fontSize="small" />}
                  variant="flat"
                  onPress={clearFilters}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>
      )}

      {nextCursor ? (
        <div ref={ref} className="grid gap-3 py-1">
          <Skeleton className="h-28 w-full rounded-xl" />
          {isLoadingMore ? (
            <Skeleton className="h-28 w-full rounded-xl" />
          ) : null}
        </div>
      ) : courses.length > 0 ? (
        <div className="py-4 text-center text-xs font-semibold text-default-400">
          You have reached the end of the catalog.
        </div>
      ) : null}
    </div>
  );
}
