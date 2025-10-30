import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });

  // Get the original plan with its courses
  const originalPlan = await prisma.coursePlan.findUnique({
    where: {
      id: parseInt(data.planId),
    },
    include: {
      courses: true,
    },
  });

  if (!originalPlan) {
    return NextResponse.json(
      { error: "Plan not found" },
      { status: 404 }
    );
  }

  // Create the new plan with copied courses
  const newPlan = await prisma.coursePlan.create({
    data: {
      name: data.planName || `${originalPlan.name} (Copy)`,
      year: originalPlan.year,
      User: {
        connect: {
          id: user?.id,
        },
      },
      courses: {
        connect: originalPlan.courses.map((course) => ({ id: course.id })),
      },
    },
  });

  return NextResponse.json(newPlan, { status: 200 });
}

