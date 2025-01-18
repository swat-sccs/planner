"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function updateSelectedCoursePlan(plan: string) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });

  if (user) {
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastSelectedPlan: plan,
      },
    });
    return "success";
  }

  return "Error: User not found";
}

export async function getSelectedCoursePlan() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });
  if (user) {
    let selectedCoursePlan = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    return selectedCoursePlan?.lastSelectedPlan;
  }
  return "";
}
