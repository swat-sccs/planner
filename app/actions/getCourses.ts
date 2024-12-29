"use server";

import { cookies } from "next/headers";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getPlanCookie, setSelectedCookie } from "./actions";

export async function getUniqueCodes() {
  const codes = await prisma.sectionAttribute.findMany();
  const daCodes: any = [];

  for (let i = 0; i < codes.length; i++) {
    if (!daCodes.includes(codes[i].code)) {
      daCodes.push(codes[i].code);
    }
  }

  return daCodes;
}

export async function getUniqueStartEndTimes() {
  const meetingTimes = await prisma.meetingTime.findMany({
    where: {
      beginTime: { not: "" },
    },
    orderBy: {
      beginTime: "asc",
    },
  });
  const startTimes: any = [];
  const endTimes: any = [];

  for (let i = 0; i < meetingTimes.length; i++) {
    if (!startTimes.includes(meetingTimes[i].beginTime)) {
      startTimes.push(meetingTimes[i].beginTime);
    }
    if (!endTimes.includes(meetingTimes[i].endTime)) {
      endTimes.push(meetingTimes[i].endTime);
    }
  }

  const times = { startTimes: startTimes, endTimes: endTimes };

  return times;
}

export async function getTerms() {
  const courses = await prisma.course.findMany();
  const output: any = [];

  for (let i = 0; i < courses.length; i++) {
    if (!output.includes(courses[i].year)) {
      output.push(courses[i].year);
    }
  }

  return output;
}

export async function setPlanCookie(plan: string) {
  (await cookies()).set("plan", plan);
}

export async function getPlanCourses1() {
  const planCookie: any = await getPlanCookie();
  const session = await auth();

  if (planCookie) {
    return await prisma.coursePlan.findUnique({
      where: {
        User: {
          uuid: session?.user.id,
        },
        id: parseInt(planCookie),
      },
      include: {
        courses: true,
      },
    });
  }
  return {};
}

export async function removeCourseFromDBPlan(course: any) {
  const id: any = await getPlanCookie();
  //let DOTW: Array<String> = dotw.split(",");
  const updatedCourse = await prisma.coursePlan.update({
    where: {
      id: parseInt(id),
    },
    data: {
      courses: {
        disconnect: {
          id: course.id,
        },
      },
    },
  });
  getCourseIds();
}

export async function getCourseIds() {
  const id: any = await getPlanCookie();
  //let DOTW: Array<String> = dotw.split(",");
  const output = [];

  if (id) {
    const ids = await prisma.coursePlan.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        courses: {
          select: {
            id: true,
          },
        },
      },
    });

    if (ids) {
      for (let theid of ids.courses) {
        output.push(theid.id);
      }
    }
  }

  //setSelectedCookie(output);

  return output;
}

export async function updateDBPlan(course: any) {
  const id: any = await getPlanCookie();
  //let DOTW: Array<String> = dotw.split(",");
  const updatedCourse = await prisma.coursePlan.update({
    where: {
      id: parseInt(id),
    },
    data: {
      courses: {
        connect: {
          id: course.id,
        },
      },
    },
  });
}

export async function getInitialCoursePlans() {
  //let DOTW: Array<String> = dotw.split(",");

  return await prisma.coursePlan.findMany({
    relationLoadStrategy: "join", // or 'query'
    include: {
      courses: true,
    },
  });
}

export async function getInitialCourses(
  query: any,
  term: any,
  dotw: any,
  stime: any
) {
  const startTime = stime.toString().split(",").filter(Number);
  return await prisma.course.findMany({
    take: 20,
    where: {
      ...(term
        ? {
            year: term,
          }
        : {}),
    },

    include: {
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
      instructor: true,
    },
  });
}

export async function getCoursePlans() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: {
      uuid: session?.user?.id,
    },
  });
  let courses: any;

  if (user) {
    courses = await prisma.coursePlan.findMany({
      where: {
        User: {
          id: user.id,
        },
      },
      include: {
        courses: true,
      },
    });
  } else {
    courses = null;
  }
  return courses;
}

export async function getCourses(
  take: any,
  query: any,
  term: any,
  dotw: any,
  stime: any
) {
  const startTime = stime.toString().split(",").filter(Number);
  console.log(startTime);

  return await prisma.course.findMany({
    take: take,

    include: {
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
      instructor: true,
    },

    ...(query
      ? {
          orderBy: [
            {
              _relevance: {
                fields: ["courseTitle", "subject", "courseNumber"],
                search: query.trim().split(" ").join(" & "),
                sort: "desc",
              },
            },
          ],
        }
      : ""),
    where: {
      ...(term
        ? {
            year: term,
          }
        : {}),
      //year: term,

      ...(query
        ? {
            OR: [
              {
                courseTitle: {
                  search: query.trim().split(" ").join(" | "),
                  mode: "insensitive",
                },
              },
              {
                sectionAttributes: {
                  some: {
                    code: {
                      search: query.trim().split(" ").join(" | "),
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                subject: {
                  search: query.trim().split(" ").join(" | "),
                  mode: "insensitive",
                },
              },
              {
                courseNumber: {
                  search: query.trim().split(" ").join(" | "),
                  mode: "insensitive",
                },
              },
              {
                instructor: {
                  displayName: {
                    search: query.trim().split(" ").join(" | "),
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
      AND: [
        {
          ...(startTime.length > 0
            ? {
                facultyMeet: {
                  meetingTimes: {
                    beginTime: {
                      in: startTime,
                    },
                  },
                },
              }
            : {}),
        },
        {
          ...(dotw.length > 0
            ? {
                facultyMeet: {
                  meetingTimes: {
                    is: {
                      monday: dotw.includes("monday") ? true : Prisma.skip,
                      tuesday: dotw.includes("tuesday") ? true : Prisma.skip,
                      wednesday: dotw.includes("wednesday")
                        ? true
                        : Prisma.skip,
                      thursday: dotw.includes("thursday") ? true : Prisma.skip,
                      friday: dotw.includes("friday") ? true : Prisma.skip,
                      saturday: dotw.includes("saturday") ? true : Prisma.skip,
                      sunday: dotw.includes("sunday") ? true : Prisma.skip,
                    },
                  },
                },
              }
            : {}),
        },
      ],
    },
  });
}
