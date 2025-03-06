"use server";

import { cookies } from "next/headers";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getPlanCookie } from "./actions";
import { Faculty, Rating } from "@prisma/client";

export async function getRatings(profUid: any) {
  let profs: Rating[] = [];
  let ratings = await prisma.rating.findMany({
    where: {
      profUid: profUid,
    },
  });

  return ratings;
}

export async function getUserRatings() {
  let ratings;
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });

  if (user) {
    ratings = await prisma.rating.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  return ratings;
}
