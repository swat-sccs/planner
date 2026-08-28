"use server";

import { cookies } from "next/headers";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getPlanCookie, setSelectedCookie } from "./actions";
import { getSelectedCoursePlan } from "./userActions";
import { generateColorFromName } from "../../components/primitives";
import { el } from "@fullcalendar/core/internal-common";

export async function getUniqueCodes() {
  return getDistributions();
}

export async function getDistributions() {
  const distributions = await prisma.sectionAttribute.findMany({
    distinct: ["code"],
    select: { code: true },
    where: { code: { not: "" } },
    orderBy: { code: "asc" },
  });

  return distributions.map(({ code }) => code);
}

export async function getUniqueStartEndTimes() {
  const [startTimes, endTimes] = await Promise.all([
    prisma.meetingTime.findMany({
      distinct: ["beginTime"],
      select: { beginTime: true },
      where: { beginTime: { not: "" } },
      orderBy: { beginTime: "asc" },
    }),
    prisma.meetingTime.findMany({
      distinct: ["endTime"],
      select: { endTime: true },
      where: { endTime: { not: "" } },
      orderBy: { endTime: "asc" },
    }),
  ]);

  return {
    startTimes: startTimes.map(({ beginTime }) => beginTime),
    endTimes: endTimes.map(({ endTime }) => endTime),
  };
}

export async function getTerms() {
  const terms = await prisma.course.findMany({
    distinct: ["year"],
    select: { year: true },
  });

  return terms.map(({ year }) => year);
}

export async function setPlanCookie(plan: string) {
  (await cookies()).set("plan", plan);
}

export async function getPlanCourses() {
  const session = await auth();
  const selectedCoursePlan = await getSelectedCoursePlan(session);

  if (selectedCoursePlan) {
    return await prisma.coursePlan.findUnique({
      where: {
        User: {
          uuid: session?.user.id,
        },
        id: parseInt(selectedCoursePlan),
      },
      include: {
        courses: {
          include: {
            instructor: true,
            facultyMeet: {
              include: {
                meetingTimes: true,
              },
            },
          },
        },
      },
    });
  }
  return {};
}

export async function removeCourseFromDBPlan(course: any) {
  const session = await auth();
  const selectedCoursePlan: any = await getSelectedCoursePlan(session);

  //let DOTW: Array<String> = dotw.split(",");
  const updatedCourse = await prisma.coursePlan.update({
    where: {
      id: parseInt(selectedCoursePlan),
    },
    data: {
      courses: {
        disconnect: {
          id: course.id,
        },
      },
    },
  });
  // getCourseIds();
  return updatedCourse;
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
  const session = await auth();
  const id = await getSelectedCoursePlan(session);
  // const id: any = await getPlanCookie();
  //let DOTW: Array<String> = dotw.split(",");
  if (id) {
    return prisma.coursePlan.update({
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

  return null;
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
  stime: any,
  distributions: string[] = []
) {
  return fetchCoursePage(
    null,
    20,
    query,
    term,
    dotw,
    stime,
    distributions,
    true
  );
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
        courses: {
          include: {
            instructor: true,
            facultyMeet: {
              include: {
                meetingTimes: true,
              },
            },
          },
        },
      },
    });
  } else {
    courses = null;
  }
  return courses;
}
export async function getAllCourses(term: any) {
  return await prisma.course.findMany({
    include: {
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
      instructor: true,
    },

    where: {
      ...(term
        ? {
            year: term,
            isShown: true,
          }
        : {}),
    },
  });
}

async function getCourseDescription(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return "No description available.";
    }

    // Depending on what the endpoint returns:
    const text = await response.text();
    return text.replace(/<[^>]*>/g, "").trim() || "No description available.";
  } catch (err) {
    console.error("Fetch failed:", err);
    return "No description available.";
  }
}

function buildCourseQuery(
  rawQuery: string,
  term: string,
  selectedDays: string[],
  selectedStartTimes: string[],
  distributions: string[]
) {
  let query = rawQuery || "";
  const properties = { dist: "", dep: "", prof: "" };
  const tokenPattern = /(\w+):(\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(query)) !== null) {
    const [, field, value] = match;
    if (field.toLowerCase() === "dist") properties.dist = value;
    if (field.toLowerCase() === "dep") properties.dep = value;
    if (field.toLowerCase() === "prof") properties.prof = value;
  }

  query = query.replace(tokenPattern, "").trim();
  const fullTextQuery = query.split(/\s+/).filter(Boolean).join(" | ");
  const andFilters: Prisma.CourseWhereInput[] = [];

  if (query) {
    andFilters.push({
      OR: [
        { courseTitle: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
        { courseNumber: { contains: query, mode: "insensitive" } },
        {
          sectionAttributes: {
            some: { code: { contains: query, mode: "insensitive" } },
          },
        },
        {
          instructor: {
            displayName: { contains: query, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (distributions.length > 0) {
    andFilters.push({
      sectionAttributes: { some: { code: { in: distributions } } },
    });
  }

  if (selectedStartTimes.length > 0) {
    andFilters.push({
      facultyMeet: {
        meetingTimes: { beginTime: { in: selectedStartTimes } },
      },
    });
  }

  if (selectedDays.length > 0) {
    const dayFilters: Prisma.MeetingTimeWhereInput = {};
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;

    for (const day of validDays) {
      if (selectedDays.includes(day)) dayFilters[day] = true;
    }

    andFilters.push({
      facultyMeet: { meetingTimes: { is: dayFilters } },
    });
  }

  const where: Prisma.CourseWhereInput = {
    isShown: true,
    ...(term ? { year: term } : {}),
    ...(properties.dist
      ? {
          sectionAttributes: {
            some: {
              code: { contains: properties.dist, mode: "insensitive" },
            },
          },
        }
      : {}),
    ...(properties.prof
      ? {
          instructor: {
            displayName: {
              contains: properties.prof,
              mode: "insensitive",
            },
          },
        }
      : {}),
    ...(properties.dep
      ? {
          subject: { contains: properties.dep, mode: "insensitive" },
        }
      : {}),
    AND: andFilters,
  };

  const orderBy: Prisma.CourseOrderByWithRelationInput[] = [
    ...(fullTextQuery
      ? [
          {
            _relevance: {
              fields: [
                Prisma.CourseOrderByRelevanceFieldEnum.courseTitle,
                Prisma.CourseOrderByRelevanceFieldEnum.subject,
                Prisma.CourseOrderByRelevanceFieldEnum.courseNumber,
              ],
              search: fullTextQuery,
              sort: Prisma.SortOrder.desc,
            },
          },
        ]
      : []),
    { id: "asc" },
  ];

  return { where, orderBy };
}

async function fetchCoursePage(
  cursor: number | null,
  pageSize: number,
  query: string,
  term: string,
  dotw: string[],
  stime: string[],
  distributions: string[],
  includeTotal = false
) {
  const selectedDays = Array.isArray(dotw) ? dotw : [];
  const selectedStartTimes = Array.isArray(stime)
    ? stime.filter(Boolean)
    : String(stime || "")
        .split(",")
        .filter(Boolean);
  const selectedDistributions = Array.isArray(distributions)
    ? distributions.filter(Boolean)
    : [];
  const { where, orderBy } = buildCourseQuery(
    query,
    term,
    selectedDays,
    selectedStartTimes,
    selectedDistributions
  );

  const [rows, totalCount] = await Promise.all([
    prisma.course.findMany({
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sectionAttributes: true,
        facultyMeet: { include: { meetingTimes: true } },
        instructor: true,
      },
      orderBy,
      where,
    }),
    includeTotal ? prisma.course.count({ where }) : Promise.resolve(null),
  ]);

  const hasMore = rows.length > pageSize;
  const courses = hasMore ? rows.slice(0, pageSize) : rows;

  return {
    courses,
    nextCursor: hasMore ? courses[courses.length - 1]?.id || null : null,
    totalCount,
  };
}

export async function getCourses(
  cursor: number | null,
  query: string,
  term: string,
  dotw: string[],
  stime: string[],
  distributions: string[] = []
) {
  return fetchCoursePage(cursor, 20, query, term, dotw, stime, distributions);
}
export async function getEvents(courses: any) {
  let output: any = [];
  //let courses: any = await getPlan Courses();

  if (courses?.courses.length > 0) {
    for (let course of courses?.courses) {
      const color = generateColorFromName(course.subject);

      const num: string = course.courseReferenceNumber;
      const meetingTimes = await prisma.meetingTime.findFirst({
        where: {
          courseReferenceNumber: num,
        },
      });

      output.push({
        classNames: "font-sans",
        textColor: "white",
        title: course?.courseTitle,
        daColor: color,
        subject: course?.subject,
        courseNumber: course?.courseNumber,
        instructor: course?.instructor.displayName,
        room:
          course?.facultyMeet.meetingTimes.building +
          " " +
          course?.facultyMeet.meetingTimes.room,
        color: "rgba(0,0,0,0)",

        borderWidth: "0px",
        daysOfWeek: [
          meetingTimes?.sunday && "0",
          meetingTimes?.monday && "1",
          meetingTimes?.tuesday && "2",
          meetingTimes?.wednesday && "3",
          meetingTimes?.thursday && "4",
          meetingTimes?.friday && "5",
          meetingTimes?.saturday && "6",
        ],

        startTime:
          meetingTimes?.beginTime.slice(0, 2) +
          ":" +
          meetingTimes?.beginTime.slice(2),
        endTime:
          meetingTimes?.endTime.slice(0, 2) +
          ":" +
          meetingTimes?.endTime.slice(2),
      });
    }
  }
  let endTime = "17:00";
  let startTime = "09:00";

  /*
  for (const event of output) {
    if (event.startTime < startTime && event.startTime != ":")
      startTime = event.startTime;
    if (event.endTime > endTime && event.endTime != ":")
      endTime = event.endTime;
    console.log(endTime);
  }
*/
  return output;
}

export async function getCourseStats(yearTerm: any) {
  //let yearTerm = (await searchParams.get("year")) || "F2025";

  const output: any = [];
  const users = await prisma.user.findMany({
    include: {
      plans: {
        include: {
          courses: {
            where: {
              year: yearTerm || "F2025",
            },
          },
        },
      },
    },
  });

  for (const user of users) {
    let userCourses = [];
    for (const plan of user.plans) {
      for (const course of plan.courses) {
        userCourses[course.id] = {
          id: course.id,
          name: course.courseTitle,
          data: ``,
        };
      }
    }

    userCourses = userCourses.filter((n: any) => n); //Get rid of null
    for (const course of userCourses) {
      if (output[course.id]) {
        let theCount = output[course.id].data;
        output[course.id] = {
          id: course.id,
          label: course.name,
          data: theCount + 1,
        };
      } else {
        output[course.id] = {
          id: course.id,
          label: course.name,
          data: 1,
        };
      }
    }
  }

  output.sort((a: any, b: any) => b.data - a.data); //Sort Greatest to Least
  let output2 = output.filter((n: any) => n); //Get rid of null

  return output2;
}
