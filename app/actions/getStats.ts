"use server";

import { cache } from "react";
import "server-only";
import prisma from "../../lib/prisma";

export const preload = async (year: string) => {
  void getItem(year, 5);
};

export const getItem = cache(async (year: string, amount: number) => {
  //const { searchParams } = await new URL(request.url);
  const yearTerm = year || "F2025";

  const popularCourses = await prisma.course.findMany({
    where: {
      year: year,
      CoursePlan: { some: {} }, // course appears in at least one plan
    },
    select: {
      id: true,
      courseTitle: true,
      _count: {
        select: { CoursePlan: true },
      },
    },
    orderBy: {
      CoursePlan: { _count: "desc" },
    },
    take: amount,
  });
  console.log(popularCourses);

  return popularCourses;
});
