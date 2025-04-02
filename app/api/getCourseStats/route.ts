// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = await new URL(request.url);
  const yearTerm = (await searchParams.get("year")) || "F2025";

  const output: any = [];
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

  for (const plan of CoursePlans) {
    for (const course of plan.courses) {
      //
      console.log(course.id);
      let theCount = output[course.id].data;
      output[course.id] = {
        id: course.id,
        label: course.courseTitle,
        data: theCount + 1,
      };
    }
  }

  output.sort((a: any, b: any) => b.count - a.count);
  let output2 = output.filter((n: any) => n);

  return NextResponse.json(output2, { status: 200 });
}
