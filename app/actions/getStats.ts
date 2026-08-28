"use server";

import { cache } from "react";
import "server-only";
import prisma from "../../lib/prisma";
import { auth } from "@/lib/auth";

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

export async function getCourseDetails(courseId: number) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: true,
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
    },
  });
}

export async function getUserPlanOptions() {
  const session = await auth();

  if (!session?.user?.id) return [];

  return prisma.coursePlan.findMany({
    where: {
      User: {
        uuid: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      year: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function addCourseToPlan(courseId: number, planId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false as const, reason: "unauthorized" as const };
  }

  const ownedPlan = await prisma.coursePlan.findFirst({
    where: {
      id: planId,
      User: {
        uuid: session.user.id,
      },
    },
    select: { id: true },
  });

  if (!ownedPlan) {
    return { ok: false as const, reason: "not-found" as const };
  }

  await prisma.coursePlan.update({
    where: { id: ownedPlan.id },
    data: {
      courses: {
        connect: { id: courseId },
      },
    },
  });

  return { ok: true as const };
}
