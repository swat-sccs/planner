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
        select: { CoursePlan: true }, // ✅ relation counting works here
      },
    },
    orderBy: {
      CoursePlan: { _count: "desc" }, // ✅ sort by relation count
    },
    take: amount,
  });
  console.log(popularCourses);

  /*
  const output: any = [];
  const users = await prisma.user.findMany({
    include: {
      plans: {
        include: {
          courses: {
            where: {
              year: yearTerm,
            },
          },
        },
      },
    },
  });

  for (const user of users) {
    let userCourses = [];
    for (const plan of user.plans) {
      for (const course of plan.courses) {
        userCourses[course.id] = {
          id: course.id,
          name: course.courseTitle,
          data: ``,
        };
      }
    }

    userCourses = userCourses.filter((n: any) => n); //Get rid of null
    for (const course of userCourses) {
      //

      if (output[course.id]) {
        let theCount = output[course.id].data;
        output[course.id] = {
          id: course.id,
          label: course.name,
          data: theCount + 1,
        };
      } else {
        output[course.id] = {
          id: course.id,
          label: course.name,
          data: 1,
        };
      }
    }
  }

  output.sort((a: any, b: any) => b.data - a.data); //Sort Greatest to Least
  let output2 = output.filter((n: any) => n); //Get rid of null
*/
  return popularCourses;
});
