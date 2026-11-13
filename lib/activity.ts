import prisma from "@/lib/prisma";

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Records at most one authenticated visit for a student on each UTC day. */
export async function recordDailyActivity(userUuid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) return;

    await prisma.userActivity.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: todayUtc(),
        },
      },
      create: { userId: user.id, date: todayUtc() },
      update: {},
    });
  } catch (error) {
    // Activity reporting should never prevent the planner from loading.
    console.error("Unable to record daily activity", error);
  }
}
