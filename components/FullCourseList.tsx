import { Course, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import CourseCard from "./CourseCard";
import { getPlanCookie } from "../app/actions";

async function getCourses(
  query: string,
  term: string,
  dotw: Array<String>,
  stime: Array<string>
) {
  //let DOTW: Array<String> = dotw.split(",");

  //query = query.trim().replace(/^[a-zA-Z0-9:]+$/g, "");

  let startTime = stime.toString().split(",").filter(Number);

  return await prisma.course.findMany({
    relationLoadStrategy: "join", // or 'query'
    include: {
      sectionAttributes: true,
      facultyMeet: {
        include: {
          meetingTimes: true,
        },
      },
      instructor: true,
    },

    orderBy: [
      {
        _relevance: {
          fields: ["courseTitle", "subject", "courseNumber"],
          search: query.trim().split(" ").join(" & "),
          sort: "desc",
        },
      },
    ],
    where: {
      ...(query
        ? {
            ...(term
              ? {
                  year: term,
                }
              : {}),
            //year: term,

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
            ],

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
                        thursday: dotw.includes("thursday")
                          ? true
                          : Prisma.skip,
                        friday: dotw.includes("friday") ? true : Prisma.skip,
                        saturday: dotw.includes("saturday")
                          ? true
                          : Prisma.skip,
                        sunday: dotw.includes("sunday") ? true : Prisma.skip,
                      },
                    },
                  },
                }
              : {}),
          }
        : {}),
    },
  });
}

export async function FullCourseList({
  query,
  term,
  dotw,
  stime,
}: {
  query: string;
  term: string;
  dotw: Array<String>;
  stime: Array<string>;
}) {
  const courseList: Course[] = await getCourses(query, term, dotw, stime);

  return (
    <>
      <div className="grid gap-4 ">
        {courseList?.map((course: any) => (
          <div key={course.id}>
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </>
  );
}
