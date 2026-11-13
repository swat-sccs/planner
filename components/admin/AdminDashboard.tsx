"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import { deleteAdminRating } from "@/actions/admin";

type Rating = {
  id: number;
  courseSubject: string | null;
  courseNumber: string | null;
  courseName: string | null;
  profDisplayName: string | null;
  yearTaken: number | null;
  termTaken: string | null;
  overallRating: number | null;
  difficulty: number | null;
  takeAgain: boolean | null;
  review: string | null;
  grade: string | null;
  createdAt: string;
  User: {
    name: string | null;
    email: string;
  } | null;
};

type DashboardData = {
  stats: {
    userCount: number;
    planCount: number;
    ratingCount: number;
    visibleCourseCount: number;
    facultyCount: number;
    recentRatingCount: number;
    averageOverallRating: number | null;
    averageDifficulty: number | null;
    takeAgainRate: number | null;
    plansPerUser: number;
    mostPopularTerm: { year: string; count: number } | undefined;
  };
  ratings: Rating[];
  dailyActiveUsers: string[];
};

const ROWS_PER_PAGE = 15;
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatTerm(term?: string) {
  if (!term) return "No term data";
  return term.replace(/^F/, "Fall ").replace(/^S/, "Spring ");
}

const activityDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function getUtcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function DailyUsageChart({ dailyActiveUsers }: { dailyActiveUsers: string[] }) {
  const [range, setRange] = useState<7 | 30 | 60>(30);
  const points = useMemo(() => {
    const visitsByDate = new Map<string, number>();
    for (const activityDate of dailyActiveUsers) {
      const key = activityDate.slice(0, 10);
      visitsByDate.set(key, (visitsByDate.get(key) || 0) + 1);
    }

    const today = new Date();
    const end = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    return Array.from({ length: range }, (_, index) => {
      const date = new Date(end);
      date.setUTCDate(end.getUTCDate() - (range - index - 1));
      return { date, count: visitsByDate.get(getUtcDateKey(date)) || 0 };
    });
  }, [dailyActiveUsers, range]);

  const maxCount = Math.max(...points.map((point) => point.count), 1);
  const totalActiveDays = points.reduce((total, point) => total + point.count, 0);
  const polylinePoints = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - (point.count / maxCount) * 86 - 7;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="border border-default-200 bg-content1/85 shadow-sm">
      <CardBody className="gap-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShowChartRoundedIcon className="text-primary" fontSize="small" />
              <h2 className="font-bold text-foreground">Daily active students</h2>
            </div>
            <p className="mt-1 text-xs text-default-500">
              {totalActiveDays.toLocaleString()} signed-in visits in the last {range} days
            </p>
          </div>
          <div className="flex rounded-lg bg-default-100 p-1">
            {([7, 30, 60] as const).map((days) => (
              <Button
                key={days}
                className="min-w-11"
                color={range === days ? "primary" : "default"}
                size="sm"
                variant={range === days ? "solid" : "light"}
                onPress={() => setRange(days)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>

        <div className="h-44 rounded-xl border border-default-100 bg-default-50/60 px-3 pb-2 pt-3">
          <svg
            aria-label={`Daily active students over the last ${range} days`}
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="img"
            viewBox="0 0 100 100"
          >
            <line stroke="currentColor" className="text-default-200" x1="0" x2="100" y1="93" y2="93" />
            <polyline
              fill="none"
              points={polylinePoints}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-primary"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between pt-1 text-[11px] text-default-400">
            <span>{activityDateFormatter.format(points[0].date)}</span>
            <span>{maxCount} active</span>
            <span>{activityDateFormatter.format(points[points.length - 1].date)}</span>
          </div>
        </div>
        <p className="text-[11px] text-default-400">
          Tracks one visit per signed-in student per UTC day. Collection begins with this release.
        </p>
      </CardBody>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border border-default-200 bg-content1/85 shadow-sm">
      <CardBody className="flex flex-row items-center gap-4 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-default-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="truncate text-xs text-default-400">{detail}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default function AdminDashboard({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const [ratings, setRatings] = useState(initialData.ratings);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [ratingToView, setRatingToView] = useState<Rating | null>(null);
  const [ratingToDelete, setRatingToDelete] = useState<Rating | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRatings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ratings;

    return ratings.filter((rating) =>
      [
        rating.User?.name,
        rating.User?.email,
        rating.profDisplayName,
        rating.courseSubject,
        rating.courseNumber,
        rating.courseName,
        rating.review,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
  }, [query, ratings]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRatings.length / ROWS_PER_PAGE)
  );
  const safePage = Math.min(page, totalPages);
  const visibleRatings = filteredRatings.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  async function handleDelete() {
    if (!ratingToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAdminRating(ratingToDelete.id);
      setRatings((current) =>
        current.filter((rating) => rating.id !== ratingToDelete.id)
      );
      setRatingToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const { stats } = initialData;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 pb-6 pt-2 lg:h-[80vh] lg:min-h-0 lg:px-0 lg:pb-0">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Students"
          value={stats.userCount.toLocaleString()}
          detail={`${stats.plansPerUser.toFixed(1)} plans per student`}
          icon={<GroupsRoundedIcon />}
        />
        <MetricCard
          label="Course plans"
          value={stats.planCount.toLocaleString()}
          detail={
            stats.mostPopularTerm
              ? `${formatTerm(stats.mostPopularTerm.year)} leads with ${stats.mostPopularTerm.count.toLocaleString()}`
              : "No term data yet"
          }
          icon={<CalendarMonthRoundedIcon />}
        />
        <MetricCard
          label="Community reviews"
          value={ratings.length.toLocaleString()}
          detail={`${stats.recentRatingCount} added in the last 30 days`}
          icon={<RateReviewRoundedIcon />}
        />
        <MetricCard
          label="Visible courses"
          value={stats.visibleCourseCount.toLocaleString()}
          detail={`${stats.facultyCount.toLocaleString()} faculty records`}
          icon={<MenuBookRoundedIcon />}
        />
      </section>

      <DailyUsageChart dailyActiveUsers={initialData.dailyActiveUsers} />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border border-default-200 bg-content1/70 shadow-none">
          <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
            <StarRoundedIcon className="text-warning" />
            <div>
              <p className="text-xs font-semibold text-default-500">
                Average rating
              </p>
              <p className="font-bold text-foreground">
                {stats.averageOverallRating?.toFixed(2) ?? "—"} / 5
              </p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 bg-content1/70 shadow-none">
          <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
            <TrendingUpRoundedIcon className="text-secondary" />
            <div>
              <p className="text-xs font-semibold text-default-500">
                Average difficulty
              </p>
              <p className="font-bold text-foreground">
                {stats.averageDifficulty?.toFixed(2) ?? "—"} / 5
              </p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 bg-content1/70 shadow-none">
          <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
            <ThumbUpAltRoundedIcon className="text-success" />
            <div>
              <p className="text-xs font-semibold text-default-500">
                Would take again
              </p>
              <p className="font-bold text-foreground">
                {stats.takeAgainRate === null
                  ? "—"
                  : `${Math.round(stats.takeAgainRate)}%`}
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      <Card className="min-h-[440px] flex-1 border border-default-200 bg-content1/85 shadow-sm lg:min-h-0">
        <CardBody className="flex min-h-0 flex-col gap-3 p-0">
          <div className="flex flex-col gap-3 border-b border-default-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SchoolRoundedIcon className="text-primary" fontSize="small" />
                <h2 className="font-bold text-foreground">Review moderation</h2>
              </div>
              <p className="mt-0.5 text-xs text-default-500">
                {filteredRatings.length} of {ratings.length} reviews
              </p>
            </div>
            <Input
              aria-label="Search reviews"
              className="w-full sm:max-w-sm"
              classNames={{
                inputWrapper:
                  "border border-default-200 bg-default-50 shadow-none",
              }}
              isClearable
              placeholder="Search people, courses, or review text"
              startContent={
                <SearchRoundedIcon className="text-default-400" fontSize="small" />
              }
              value={query}
              variant="bordered"
              onClear={() => {
                setQuery("");
                setPage(1);
              }}
              onValueChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-2 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
            <Table
              removeWrapper
              isHeaderSticky
              aria-label="Community review moderation table"
              classNames={{
                th: "bg-default-50 text-xs font-bold uppercase tracking-wide text-default-500",
                td: "border-b border-default-100 py-3",
                tr: "cursor-pointer transition-colors hover:bg-default-100/60 focus-visible:bg-default-100/60",
              }}
              onRowAction={(key) => {
                const selectedRating = visibleRatings.find(
                  (rating) => rating.id === Number(key)
                );
                if (selectedRating) setRatingToView(selectedRating);
              }}
            >
              <TableHeader>
                <TableColumn>REVIEWER</TableColumn>
                <TableColumn>PROFESSOR & COURSE</TableColumn>
                <TableColumn>RATING</TableColumn>
                <TableColumn>REVIEW</TableColumn>
                <TableColumn>SUBMITTED</TableColumn>
                <TableColumn align="center">ACTION</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No reviews match this search.">
                {visibleRatings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="max-w-48">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {rating.User?.name || "Unnamed student"}
                        </p>
                        <p className="truncate text-xs text-default-400">
                          {rating.User?.email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-56">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {rating.profDisplayName || "Unknown professor"}
                        </p>
                        <p className="truncate text-xs text-default-400">
                          {[rating.courseSubject, rating.courseNumber]
                            .filter(Boolean)
                            .join(" ") || rating.courseName || "Unknown course"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Chip color="warning" size="sm" variant="flat">
                          {rating.overallRating ?? "—"} / 5
                        </Chip>
                        <span className="text-xs text-default-400">
                          D {rating.difficulty ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p
                        className="max-w-md truncate text-sm text-default-600"
                        title={rating.review || undefined}
                      >
                        {rating.review || "No written review"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-nowrap text-sm text-default-500">
                        {dateFormatter.format(new Date(rating.createdAt))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        aria-label={`Delete review by ${
                          rating.User?.name || "unnamed student"
                        }`}
                        color="danger"
                        size="sm"
                        variant="light"
                        onClick={(event) => event.stopPropagation()}
                        onPress={() => setRatingToDelete(rating)}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRatings.length > ROWS_PER_PAGE ? (
            <div className="flex justify-center border-t border-default-200 px-4 py-3">
              <Pagination
                showControls
                color="primary"
                page={safePage}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Modal
        backdrop="blur"
        classNames={{
          base: "max-h-[82vh] border border-default-200 bg-content1",
          wrapper: "overflow-hidden",
        }}
        isOpen={Boolean(ratingToView)}
        placement="center"
        size="2xl"
        onOpenChange={(isOpen) => {
          if (!isOpen) setRatingToView(null);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Full review
                </p>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {ratingToView?.profDisplayName || "Unknown professor"}
                </h2>
                <p className="text-sm font-normal text-default-500">
                  {[ratingToView?.courseSubject, ratingToView?.courseNumber]
                    .filter(Boolean)
                    .join(" ") || ratingToView?.courseName || "Unknown course"}
                </p>
              </ModalHeader>

              <ModalBody className="min-h-0 overflow-hidden px-6 py-5">
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Chip color="warning" size="sm" variant="flat">
                    Overall {ratingToView?.overallRating ?? "—"} / 5
                  </Chip>
                  <Chip color="secondary" size="sm" variant="flat">
                    Difficulty {ratingToView?.difficulty ?? "—"} / 5
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Take again: {ratingToView?.takeAgain === null
                      ? "Not answered"
                      : ratingToView?.takeAgain
                        ? "Yes"
                        : "No"}
                  </Chip>
                  {ratingToView?.grade ? (
                    <Chip size="sm" variant="bordered">
                      Grade {ratingToView.grade}
                    </Chip>
                  ) : null}
                  {ratingToView?.termTaken || ratingToView?.yearTaken ? (
                    <Chip size="sm" variant="bordered">
                      {[ratingToView.termTaken, ratingToView.yearTaken]
                        .filter(Boolean)
                        .join(" ")}
                    </Chip>
                  ) : null}
                </div>

                <div className="shrink-0 rounded-xl bg-default-50 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    {ratingToView?.User?.name || "Unnamed student"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-default-400">
                    <span>{ratingToView?.User?.email || "No email"}</span>
                    {ratingToView ? (
                      <span>{dateFormatter.format(new Date(ratingToView.createdAt))}</span>
                    ) : null}
                  </div>
                </div>

                <section className="flex min-h-0 flex-1 flex-col">
                  <h3 className="mb-2 shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-default-500">
                    Review message
                  </h3>
                  <div className="min-h-24 flex-1 overflow-y-auto rounded-xl border border-default-200 bg-default-50/60 p-4 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-default-700">
                      {ratingToView?.review || "No written review was provided."}
                    </p>
                  </div>
                </section>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t border-default-200 px-6 py-4">
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={Boolean(ratingToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setRatingToDelete(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Delete this review?</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              This permanently removes the rating for{" "}
              <span className="font-semibold text-foreground">
                {ratingToDelete?.profDisplayName || "this professor"}
              </span>
              . This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isDeleting}
              variant="light"
              onPress={() => setRatingToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              onPress={handleDelete}
            >
              Delete review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
