import { CoursePlan } from "@prisma/client";
// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = await new URL(request.url);
  const yearTerm = (await searchParams.get("year")) || "F2025";

  const output: any = [];
  const users = await prisma.user.findMany({
    include: {
      plans: {
        include: {
          courses: true,
        },
      },
    },
  });

  for (const user of users) {
    let userCourses = [];
    for (const plan of user.plans) {
      for (const course of plan.courses) {
        console.log(course);
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
  /*
  const CoursePlans = await prisma.coursePlan.findMany({
    where: {
      year: yearTerm,
    },
    include: {
      courses: true,
    },
  });
  
  for (const plan of CoursePlans) {
    for (const course of plan.courses) {
      console.log(course);
      output[course.id] = { id: 0, name: "", data: 0 };
    }
  }
    */
  /*
  for (const plan of CoursePlans) {
    for (const course of plan.courses) {
      //

      if (output[course.id]) {
        let theCount = output[course.id].data;
        output[course.id] = {
          id: course.id,
          label: course.courseTitle,
          data: theCount + 1,
        };
      } else {
        output[course.id] = {
          id: course.id,
          label: course.courseTitle,
          data: 1,
        };
      }
    }
  }
    */

  output.sort((a: any, b: any) => b.data - a.data); //Sort Greatest to Least
  let output2 = output.filter((n: any) => n); //Get rid of null
  console.log(output2);

  return NextResponse.json(output2, { status: 200 });
}
