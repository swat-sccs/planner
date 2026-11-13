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
  // `Faculty.avgRating` is a cache that is not populated for older reviews.
  // Drive this directory from Rating instead, so every professor with a
  // submitted rating appears even when their cached value is null or stale.
  const ratingSummaries = await prisma.rating.groupBy({
    by: ["profUid"],
    where: {
      profUid: { not: null },
      overallRating: { not: null },
    },
    _count: { _all: true },
    _avg: { overallRating: true },
  });

  const ratingsByUid = new Map(
    ratingSummaries
      .filter((summary): summary is typeof summary & { profUid: string } =>
        Boolean(summary.profUid)
      )
      .map((summary) => [summary.profUid, summary])
  );

  const AllProfs = await prisma.faculty.findMany({
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
      uid: { in: Array.from(ratingsByUid.keys()) },
      ...(query
        ? {
            displayName: {
              // search: query.trim().split(" ").join(" | "),
              mode: "insensitive",
              contains: query.trim().split(" ").join(" | "),
            },
          }
        : {}),
    },
  });

  const profs: Array<Faculty & { numRatings: number }> = [];
  for (const prof of AllProfs) {
    let uniqueNames = returnProfNameList(profs);
    if (!uniqueNames.includes(prof.displayName)) {
      const summary = ratingsByUid.get(prof.uid);
      if (!summary) continue;

      const myProf = {
        ...prof,
        // Use the aggregate as the source of truth, rather than a cached
        // Faculty value which may not have been backfilled in production.
        avgRating: summary._avg.overallRating,
        numRatings: summary._count._all,
      };
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

  let terms = years.sort((a: any, b: any) => {
    // Extract the prefix (f or s) and year (e.g., 2025, 2024) from each string
    const yearA = parseInt(a.slice(1)); // Get year part from 'f2025' or 's2024'
    const yearB = parseInt(b.slice(1)); // Get year part from 'f2025' or 's2024'

    // Define the sorting order based on the prefix and year
    if (yearA === yearB) {
      return a.charAt(0).localeCompare(b.charAt(0)); // Sort by 'f' and 's' if years are the same
    }

    // Sort by year (higher years come first)
    return yearB - yearA;
  });

  return terms;
}
