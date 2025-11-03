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

  query = query
    .replace(/[^a-zA-Z0-9 ]+/gi, "")
    .split(" ")
    .join(" | ");

  query = "american";

  return await prisma.course.findMany({
    take: 20,
    include: {
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
      instructor: true,
    },

    ...(query != ""
      ? {
          orderBy: [
            {
              _relevance: {
                fields: ["courseTitle", "subject", "courseNumber"],
                search: query,
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
            isShown: true,
          }
        : {}),
      //year: term,

      ...(query
        ? {
            OR: [
              {
                courseTitle: {
                  //contains: query,
                  search: query,
                  mode: "insensitive",
                },
              },
              {
                sectionAttributes: {
                  some: {
                    code: {
                      contains: query,
                      //search: query,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                subject: {
                  contains: query,
                  //search: query,
                  mode: "insensitive",
                },
              },
              {
                courseNumber: {
                  //contains: query,
                  search: query,
                  mode: "insensitive",
                },
              },
              {
                instructor: {
                  displayName: {
                    contains: query,
                    //search: query,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
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

export async function getCourses(
  take: any,
  query: any,
  term: any,
  dotw: any,
  stime: any
) {
  const startTime = stime.toString().split(",").filter(Number);

  let properties = {
    dist: "",
    dep: "",
    prof: "",
  };

  if (query.includes(":")) {
    const regex = /(\w+):(\S+)/g; // global flag to catch all key:value pairs
    let match;

    while ((match = regex.exec(query)) !== null) {
      const [, field, value] = match;

      switch (field.toLowerCase()) {
        case "dist":
          properties.dist = value;
          break;
        case "dep":
          properties.dep = value;
          break;
        case "prof":
          properties.prof = value;
          break;
      }
    }

    // Remove all key:value tokens from query
    query = query.replace(regex, "").trim();
  }

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
    where: {
      ...(term
        ? {
            year: term,
            isShown: true,
          }
        : {}),
      courseTitle: {
        contains: query,
        mode: "insensitive",
      },
      ...(properties.dist != ""
        ? {
            sectionAttributes: {
              some: {
                code: {
                  contains: properties.dist,
                  mode: "insensitive",
                },
              },
            },
          }
        : {}),

      ...(properties.prof != ""
        ? {
            instructor: {
              displayName: {
                contains: properties.prof,
                mode: "insensitive",
              },
            },
          }
        : {}),

      ...(properties.dep != ""
        ? {
            subject: {
              contains: properties.dep,
              mode: "insensitive",
            },
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
  /*
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
                search: query,
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
            isShown: true,
          }
        : {}),

      //year: term,

      ...(query
        ? {
            OR: [
              {
                courseTitle: {
                  contains: query,
                  //search: query,
                  mode: "insensitive",
                },
              },
              {
                sectionAttributes: {
                  some: {
                    code: {
                      contains: query,
                      //search: query,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                subject: {
                  contains: query,
                  //search: query,
                  mode: "insensitive",
                },
              },
              {
                courseNumber: {
                  contains: query,
                  //search: query,
                  mode: "insensitive",
                },
              },
              {
                instructor: {
                  displayName: {
                    contains: query,
                    //search: query,
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
  */
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
