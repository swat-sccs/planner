"use server";

import oauth2Client from "../../lib/google-oauth";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function getCal() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3" });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event, i) => {
    const start = event.start?.dateTime || event.start?.date;
    console.log(`${start} - ${event.summary}`);
  });

  return events;
}
