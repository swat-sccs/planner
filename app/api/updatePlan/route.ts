// api/test.ts
import { NextResponse, NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { auth } from "../../../lib/auth";
import { getPlanCookie } from "../../../app/actions";

export async function POST(request: NextRequest) {
  const course = await request.json();
  const planId = await getPlanCookie();

  if (planId) {
    let plan: any;

    if (planId) {
      plan = await prisma.coursePlan.update({
        where: {
          id: parseInt(planId),
        },
        data: {
          courses: {
            connect: {
              id: course.course.id,
            },
          },
        },
      });
    }
  }

  return NextResponse.json(planId, { status: 200 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      //@ts-ignore
      uuid: session?.user?.id,
    },
  });
  const courses = await prisma.coursePlan.findMany({
    where: {
      User: {
        //@ts-ignore
        id: user.id,
      },
    },
    include: {
      courses: true,
    },
  });
  console.log(courses);
  return NextResponse.json(courses, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const data = await request.json();

  //@ts-ignore
  const plan = await prisma.coursePlan.delete({
    where: {
      //@ts-ignore
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