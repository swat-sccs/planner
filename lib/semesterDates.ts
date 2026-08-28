import "server-only";

const CALENDAR_FEED_URL =
  "https://25livepub.collegenet.com/calendars/swarthmore-college-events.rss";

type SemesterKind = "fall" | "spring";

type TargetSemester = {
  kind: SemesterKind;
  year: number;
  code: string;
  label: string;
};

type MeetingDateRange = {
  startDate: string;
  endDate: string;
};

type CalendarBoundary = {
  date: string;
  title: string;
};

function currentSemester(now: Date): TargetSemester {
  const month = now.getMonth();
  const isFall =
    month >= 6 && (month < 11 || (month === 11 && now.getDate() < 25));
  const year = isFall
    ? now.getFullYear()
    : month === 11
      ? now.getFullYear() + 1
      : now.getFullYear();

  return {
    kind: isFall ? "fall" : "spring",
    year,
    code: `${isFall ? "F" : "S"}${year}`,
    label: `${isFall ? "Fall" : "Spring"} ${year}`,
  };
}

function parseTerm(term: string): TargetSemester | null {
  const match = /^([FS])(\d{4})$/i.exec(term);
  if (!match) return null;

  const kind = match[1].toUpperCase() === "F" ? "fall" : "spring";
  const year = Number(match[2]);
  return {
    kind,
    year,
    code: `${kind === "fall" ? "F" : "S"}${year}`,
    label: `${kind === "fall" ? "Fall" : "Spring"} ${year}`,
  };
}

function mostCommonCourseSemester(courseTerms: string[]) {
  const parsedTerms = courseTerms
    .map(parseTerm)
    .filter((term): term is TargetSemester => term !== null);
  if (parsedTerms.length === 0) return null;

  const termCounts = new Map<string, number>();
  for (const term of parsedTerms) {
    termCounts.set(term.code, (termCounts.get(term.code) || 0) + 1);
  }

  return parsedTerms.reduce((selected, term) =>
    (termCounts.get(term.code) || 0) > (termCounts.get(selected.code) || 0)
      ? term
      : selected
  );
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function extractCalendarBoundaries(xml: string) {
  const starts: CalendarBoundary[] = [];
  const ends: CalendarBoundary[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemPattern.exec(xml)) !== null) {
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemMatch[1]);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemMatch[1]);
    if (!titleMatch || !pubDateMatch) continue;

    const title = decodeXml(titleMatch[1]).trim();
    const parsedDate = new Date(decodeXml(pubDateMatch[1]).trim());
    if (Number.isNaN(parsedDate.getTime())) continue;

    const boundary = { date: parsedDate.toISOString().slice(0, 10), title };
    if (/^classes begin$/i.test(title)) starts.push(boundary);
    if (/^classes(?: and seminars)? end\b/i.test(title)) ends.push(boundary);
  }

  return { starts, ends };
}

function isDateInSemester(date: string, semester: TargetSemester) {
  const month = Number(date.slice(5, 7));
  const year = Number(date.slice(0, 4));
  return (
    year === semester.year &&
    (semester.kind === "fall" ? month >= 7 : month <= 6)
  );
}

function normalizeDate(value: string) {
  if (!value) return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value);
  if (slashMatch) {
    return `${slashMatch[3]}-${slashMatch[1].padStart(2, "0")}-${slashMatch[2].padStart(2, "0")}`;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate.toISOString().slice(0, 10);
}

function meetingDateFallback(
  meetingDates: MeetingDateRange[],
  semester: TargetSemester
) {
  const starts = meetingDates
    .map(({ startDate }) => normalizeDate(startDate))
    .filter(
      (date): date is string =>
        date !== null && isDateInSemester(date, semester)
    )
    .sort();
  const ends = meetingDates
    .map(({ endDate }) => normalizeDate(endDate))
    .filter(
      (date): date is string =>
        date !== null && isDateInSemester(date, semester)
    )
    .sort();

  return {
    startDate: starts[0] || null,
    endDate: ends[ends.length - 1] || null,
  };
}

function semesterFeedUrl(semester: TargetSemester) {
  const startDate = `${semester.year}${semester.kind === "fall" ? "0701" : "0101"}`;
  const endDate = `${semester.year}${semester.kind === "fall" ? "1231" : "0630"}`;
  const url = new URL(CALENDAR_FEED_URL);
  url.searchParams.set("startdate", startDate);
  url.searchParams.set("enddate", endDate);
  url.searchParams.set("previousweeks", "0");
  url.searchParams.set("search", "Classes");
  return url;
}

async function readCalendarSemester(semester: TargetSemester) {
  const feedUrl = semesterFeedUrl(semester);

  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 6 * 60 * 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Calendar returned ${response.status}`);

    const boundaries = extractCalendarBoundaries(await response.text());
    return {
      start: boundaries.starts.find(({ date }) =>
        isDateInSemester(date, semester)
      ),
      end: boundaries.ends.find(({ date }) => isDateInSemester(date, semester)),
      feedAvailable: true,
      feedUrl: feedUrl.toString(),
    };
  } catch (error) {
    console.error(
      `Unable to read the Swarthmore calendar feed for ${semester.label}`,
      error
    );
    return {
      start: undefined,
      end: undefined,
      feedAvailable: false,
      feedUrl: feedUrl.toString(),
    };
  }
}

export async function getSemesterDateSuggestion({
  fallbackTerm,
  courseTerms,
  meetingDates,
  now = new Date(),
}: {
  fallbackTerm?: string;
  courseTerms: string[];
  meetingDates: MeetingDateRange[];
  now?: Date;
}) {
  const dateBasedSemester = currentSemester(now);
  const selectedCourseSemester =
    parseTerm(fallbackTerm || "") || mostCommonCourseSemester(courseTerms);
  const dateBasedCalendar = await readCalendarSemester(dateBasedSemester);
  const shouldUseCourseSelection = Boolean(
    (!dateBasedCalendar.start || !dateBasedCalendar.end) &&
      selectedCourseSemester &&
      selectedCourseSemester.code !== dateBasedSemester.code
  );
  const semester = shouldUseCourseSelection
    ? selectedCourseSemester!
    : dateBasedSemester;
  const calendar = shouldUseCourseSelection
    ? await readCalendarSemester(semester)
    : dateBasedCalendar;
  const fallback = meetingDateFallback(meetingDates, semester);

  const startDate = calendar.start?.date || fallback.startDate;
  const endDate = calendar.end?.date || fallback.endDate;

  return {
    semester: semester.label,
    semesterCode: semester.code,
    semesterSource: shouldUseCourseSelection
      ? ("course-selection" as const)
      : ("current-date" as const),
    startDate,
    endDate,
    startSource: calendar.start
      ? "college-calendar"
      : fallback.startDate
        ? "course-data"
        : null,
    endSource: calendar.end
      ? "college-calendar"
      : fallback.endDate
        ? "course-data"
        : null,
    feedAvailable: calendar.feedAvailable,
    feedUrl: calendar.feedUrl,
  };
}
