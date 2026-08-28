"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function getAdminDashboardData() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    userCount,
    planCount,
    ratingCount,
    visibleCourseCount,
    facultyCount,
    recentRatingCount,
    ratingAverages,
    takeAgainYesCount,
    takeAgainResponseCount,
    plansByTerm,
    ratings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.coursePlan.count(),
    prisma.rating.count(),
    prisma.course.count({ where: { isShown: true } }),
    prisma.faculty.count(),
    prisma.rating.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.rating.aggregate({
      _avg: {
        overallRating: true,
        difficulty: true,
      },
    }),
    prisma.rating.count({ where: { takeAgain: true } }),
    prisma.rating.count({ where: { takeAgain: { not: null } } }),
    prisma.coursePlan.groupBy({
      by: ["year"],
      _count: { year: true },
    }),
    prisma.rating.findMany({
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const mostPopularTerm = plansByTerm.reduce<
    { year: string; count: number } | undefined
  >((current, term) => {
    const count = term._count.year;
    return !current || count > current.count
      ? { year: term.year, count }
      : current;
  }, undefined);

  return {
    stats: {
      userCount,
      planCount,
      ratingCount,
      visibleCourseCount,
      facultyCount,
      recentRatingCount,
      averageOverallRating: ratingAverages._avg.overallRating,
      averageDifficulty: ratingAverages._avg.difficulty,
      takeAgainRate:
        takeAgainResponseCount > 0
          ? (takeAgainYesCount / takeAgainResponseCount) * 100
          : null,
      plansPerUser: userCount > 0 ? planCount / userCount : 0,
      mostPopularTerm,
    },
    ratings: ratings.map((rating) => ({
      ...rating,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    })),
  };
}

export async function deleteAdminRating(ratingId: number) {
  await requireAdmin();

  await prisma.rating.delete({
    where: { id: ratingId },
  });

  revalidatePath("/admin");
  return { ok: true as const };
}
