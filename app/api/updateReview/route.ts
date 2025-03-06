import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";

export async function POST(request: NextRequest) {
  const data = await request.json();
  const ratingID = parseInt(await data.id);

  const session = await auth();

  if (session?.user) {
    const updateUser = await prisma.rating.update({
      where: {
        id: ratingID,
      },
      data: {
        overallRating: data.overallRating,
        difficulty: data.difficulty,
        takeAgain: data.takeAgain,
        forCredit: data.forCredit,
        grade: data.grade,
        review: data.review,
        termTaken: data.termTaken,
        yearTaken: data.yearTaken,
      },
    });
  }

  /*

  overallRating: props.editRating.overallRating,
          difficulty: props.editRating.difficulty,
          takeAgain: props.editRating.takeAgain,
          forCredit: props.editRating.forCredit,
          grade: props.editRating.grade,
          review: props.editRating.review,
          termTaken: props.editRating.termTaken,
          yearTaken: props.editRating.yearTaken,*/

  return NextResponse.json("Success", { status: 200 });
}
