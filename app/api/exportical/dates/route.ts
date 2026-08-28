import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSemesterDateSuggestion } from "@/lib/semesterDates";

export async function GET(request: NextRequest) {
  const session = await auth();
  const planId = Number(request.nextUrl.searchParams.get("id"));

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Number.isInteger(planId) || planId <= 0) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const coursePlan = await prisma.coursePlan.findFirst({
    where: {
      id: planId,
      User: { uuid: session.user.id },
    },
    select: {
      courses: {
        select: {
          year: true,
          facultyMeet: {
            select: {
              meetingTimes: {
                select: {
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!coursePlan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const suggestion = await getSemesterDateSuggestion({
    fallbackTerm: request.cookies.get("termCookie")?.value,
    courseTerms: coursePlan.courses.map(({ year }) => year),
    meetingDates: coursePlan.courses.map(({ facultyMeet }) => ({
      startDate: facultyMeet.meetingTimes.startDate,
      endDate: facultyMeet.meetingTimes.endDate,
    })),
  });

  return NextResponse.json(suggestion);
}
