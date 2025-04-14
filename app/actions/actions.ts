"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import ical, { ICalCalendarMethod } from "ical-generator";
import { Prisma } from "@prisma/client";

export async function setPlanCookie(plan: string) {
  (await cookies()).set("plan", plan);
}

export async function getPlanCookie() {
  const cookieStore = await cookies();
  const plan = cookieStore.get("plan");

  const out = plan ? plan.value : undefined;

  return out;
}

export async function setSelectedCookie(selected: any) {
  (await cookies()).set("selectedCourses", selected);
}

export async function getSelectedCoursesCookie() {
  const cookieStore = await cookies();
  const plan = cookieStore.get("selectedCourses");

  const out = plan ? plan.value : undefined;

  return out;
}

export async function getFirstDayOfSem() {
  const info = await prisma.info.findFirst();
  console.log(info);
  return info?.firstDayOfSem;
}

export async function getLastDayOfSem() {
  const info = await prisma.info.findFirst();
  return info?.lastDayOfSem;
}

export async function updateFirstDayOfSem(firstDayOfSem: any) {
  const info = await prisma.info.upsert({
    where: {
      id: 0,
    },
    update: {
      firstDayOfSem: firstDayOfSem,
    },
    create: {
      id: 0,
      firstDayOfSem: new Date("Aug, 31 2025"),
      lastDayOfSem: new Date("Aug, 31 2025"),
      semester: "F2026",
    },
  });
  return info.lastDayOfSem;
}

export async function updateLastDayOfSem(lastDayOfSem: any) {
  const info = await prisma.info.upsert({
    where: {
      id: 0,
    },
    update: {
      lastDayOfSem: lastDayOfSem,
    },
    create: {
      id: 0,
      firstDayOfSem: new Date("Aug, 31 2025"),
      lastDayOfSem: new Date("Aug, 31 2025"),
      semester: "F2026",
    },
  });
  return info.lastDayOfSem;
}
