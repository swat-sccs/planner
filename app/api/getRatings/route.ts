import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ratings = await prisma.rating.findMany({
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(ratings, { status: 200 });
}
