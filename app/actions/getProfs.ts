"use server";

import { cookies } from "next/headers";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getPlanCookie } from "./actions";
import { Faculty, Rating } from "@prisma/client";

function returnProfNameList(list: Faculty[]) {
  let output = [];

  for (let item of list) {
    output.push(item.displayName);
  }
  return output;
}

export async function getUniqueProfs() {
  let profs: Faculty[] = [];
  let AllProfs = await prisma.faculty.findMany({
    orderBy: {
      displayName: "desc",
    },
  });

  for (let prof of AllProfs) {
    let uniqueNames = returnProfNameList(profs);
    if (!uniqueNames.includes(prof.displayName)) {
      profs.push(prof);
    }
  }

  return profs;
}

export async function getUniqueProfsWithRatings() {
  let profs: Faculty[] = [];
  let AllProfs = await prisma.faculty.findMany({
    orderBy: {
      displayName: "desc",
    },
    include: {
      courses: true,
    },
    where: {
      NOT: {
        avgRating: null,
      },
    },
  });

  for (let prof of AllProfs) {
    let uniqueNames = returnProfNameList(profs);
    if (!uniqueNames.includes(prof.displayName)) {
      let RatingCount = await prisma.rating.findMany({
        where: {
          profUid: prof.uid,
        },
      });
      let myProf: any = prof;
      myProf.numRatings = RatingCount.length;
      profs.push(myProf);
    }
  }

  return profs;
}

export async function searchProfs(query: any) {
  let profs: Faculty[] = [];
  let AllProfs = await prisma.faculty.findMany({
    ...(query
      ? {
          orderBy: [
            {
              _relevance: {
                fields: ["displayName"],
                search: query.trim().split(" ").join(" & "),
                sort: "desc",
              },
            },
          ],
        }
      : ""),

    include: {
      courses: true,
    },
    where: {
      AND: {
        NOT: {
          avgRating: null,
        },
        ...(query
          ? {
              displayName: {
                // search: query.trim().split(" ").join(" | "),
                mode: "insensitive",
                contains: query.trim().split(" ").join(" | "),
              },
            }
          : ""),
      },
    },
  });

  for (let prof of AllProfs) {
    let uniqueNames = returnProfNameList(profs);
    if (!uniqueNames.includes(prof.displayName)) {
      let RatingCount = await prisma.rating.findMany({
        where: {
          profUid: prof.uid,
        },
      });
      let myProf: any = prof;
      myProf.numRatings = RatingCount.length;
      profs.push(myProf);
    }
  }

  return profs;
}

export async function getNumRatings(uid: any) {
  let ratings: any = [];

  let num5 = await prisma.rating.findMany({
    where: {
      profUid: uid,
      overallRating: 5,
    },
  });
  let num4 = await prisma.rating.findMany({
    where: {
      profUid: uid,
      overallRating: 4,
    },
  });
  let num3 = await prisma.rating.findMany({
    where: {
      profUid: uid,
      overallRating: 3,
    },
  });
  let num2 = await prisma.rating.findMany({
    where: {
      profUid: uid,
      overallRating: 2,
    },
  });
  let num1 = await prisma.rating.findMany({
    where: {
      profUid: uid,
      overallRating: 1,
    },
  });

  ratings = { five: num5, four: num4, three: num3, two: num2, one: num1 };

  return ratings;
}

export async function getProfs() {
  let profs: Faculty[] = [];
  let AllProfs = await prisma.faculty.findMany({
    orderBy: {
      displayName: "desc",
    },
  });

  return AllProfs;
}

export async function getProfsByUid(theUid: string) {
  let profs: Faculty[] = [];
  let theProf = await prisma.faculty.findUnique({
    where: {
      uid: theUid,
    },
  });

  return theProf;
}

export async function getYears() {
  let years: any = [];
  let AllCourses = await prisma.course.findMany();

  for (let i = 0; i < AllCourses.length; i++) {
    if (!years.includes(AllCourses[i].year)) {
      years.push(AllCourses[i].year);
    }
  }

  return years.sort();
}
