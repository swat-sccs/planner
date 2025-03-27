// api/test.ts
import { NextResponse, NextRequest } from "next/server";

import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import moment from "moment";

export async function GET(request: NextRequest) {
  //console.log(plans);
  return NextResponse.json("hi", { status: 200 });
}
