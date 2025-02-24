// api/gcal.ts
import { NextResponse, NextRequest } from "next/server";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  return NextResponse.json("hi", { status: 200 });
}

export async function GET(request: NextRequest) {
  // Import the Google Calendar API
  const { google } = require("googleapis");
  const data = await request.json();
  // Fetch Calendar Service Instance

  let api = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_API,
  });

  return NextResponse.json(api, { status: 200 });
}
