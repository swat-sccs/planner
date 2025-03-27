// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import moment from "moment";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });

  const plan = await prisma.coursePlan.create({
    data: {
      name: data.planName,
      year: "F2025",
      User: {
        connect: {
          id: user?.id,
        },
      },
    },
  });

  return NextResponse.json(plan, { status: 200 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });
  const courses = await prisma.coursePlan.findMany({
    where: {
      User: {
        id: user?.id,
      },
    },
    include: {
      courses: true,
    },
  });

  //console.log(plans);
  return NextResponse.json(courses, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  const plan = await prisma.coursePlan.delete({
    where: {
      id: parseInt(data.planId),
    },
  });

  return NextResponse.json(plan, { status: 200 });
}

// To handle a POST request to /api
/*
export async function POST(request: NextRequest) {

  return NextResponse.json(output, { status: 200 });
}
*/
