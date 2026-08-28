"use client";

import { useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Skeleton,
} from "@nextui-org/react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { Rating } from "@prisma/client";

import { getUserRatings } from "@/actions/getRatings";
import EditModal from "@/components/EditModal";

function RatingCard({
  rating,
  onEdit,
}: {
  rating: Rating;
  onEdit: (rating: Rating) => void;
}) {
  const displayName =
    rating.profDisplayName?.replace("&#39;", "'") || "Unknown professor";
  const ratingColor =
    (rating.overallRating || 0) >= 4
      ? "success"
      : (rating.overallRating || 0) >= 3
        ? "warning"
        : "danger";

  return (
    <Card className="min-h-64 w-full border border-default-200 bg-content1/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-content2">
      <CardBody className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <Avatar
            className="shrink-0 bg-primary/10 text-primary"
            classNames={{ name: "text-base font-bold" }}
            name={displayName}
            showFallback
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                  {displayName}
                </h2>
                <p className="mt-0.5 truncate text-sm font-medium text-default-500">
                  {[rating.courseSubject, rating.courseNumber]
                    .filter(Boolean)
                    .join(" ") || rating.courseName || "Unknown course"}
                </p>
              </div>
              <Chip
                color={ratingColor}
                size="sm"
                startContent={
                  <StarRoundedIcon className="ml-0.5" fontSize="small" />
                }
                variant="flat"
              >
                <span className="font-bold">{rating.overallRating ?? "—"}</span>
              </Chip>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip size="sm" variant="bordered">
            Difficulty {rating.difficulty ?? "—"}/5
          </Chip>
          <Chip size="sm" variant="bordered">
            Take again:{" "}
            {rating.takeAgain === null
              ? "Not answered"
              : rating.takeAgain
                ? "Yes"
                : "No"}
          </Chip>
          {rating.grade ? (
            <Chip size="sm" variant="bordered">
              Grade {rating.grade}
            </Chip>
          ) : null}
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-default-600">
          {rating.review || "No written review provided."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-default-100 pt-3">
          <span className="text-xs font-semibold text-default-500">
            {[rating.termTaken, rating.yearTaken].filter(Boolean).join(" ") ||
              "Semester not listed"}
          </span>
          <Button
            color="primary"
            size="sm"
            startContent={<EditRoundedIcon fontSize="small" />}
            variant="flat"
            onPress={() => onEdit(rating)}
          >
            Edit rating
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function MyRatingsPage() {
  const [userRatings, setUserRatings] = useState<Rating[] | undefined>();
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  const loadUserRatings = useCallback(async () => {
    const ratings = await getUserRatings();
    setUserRatings(ratings || []);
  }, []);

  useEffect(() => {
    loadUserRatings();
  }, [loadUserRatings]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-6 pt-2 lg:h-[88.8vh] lg:min-h-0 lg:px-0 lg:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Your contributions
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My ratings
          </h1>
          <p className="mt-1 text-sm text-default-500">
            Revisit and update the professor reviews you have shared.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userRatings ? (
            <div className="w-fit rounded-full bg-default-100 px-3 py-1.5 text-xs font-semibold text-default-500">
              {userRatings.length} {userRatings.length === 1 ? "rating" : "ratings"}
            </div>
          ) : null}
          <Button
            as={NextLink}
            className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
            href="/rating"
            startContent={<AddRoundedIcon fontSize="small" />}
          >
            Leave a rating
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
        {!userRatings ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                className="min-h-64 border border-default-200 bg-content1/80 shadow-sm"
                key={index}
              >
                <CardBody className="flex gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-3/5 rounded-lg" />
                      <Skeleton className="h-3 w-2/5 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-4/5 rounded-full" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="mt-auto h-9 w-full rounded-xl" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : userRatings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {userRatings.map((rating) => (
              <RatingCard
                key={rating.id}
                rating={rating}
                onEdit={setSelectedRating}
              />
            ))}
          </div>
        ) : (
          <Card className="border border-default-200 bg-content1/80 shadow-sm">
            <CardBody className="grid min-h-64 place-items-center px-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <RateReviewRoundedIcon />
                </div>
                <h2 className="mt-4 text-lg font-bold text-foreground">
                  You have not left a rating yet
                </h2>
                <p className="mt-1 text-sm leading-6 text-default-500">
                  Share your experience to help other students choose their
                  courses and professors.
                </p>
                <Button
                  as={NextLink}
                  className="mt-4 bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                  href="/rating"
                >
                  Write your first rating
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <EditModal
        editRating={selectedRating}
        open={Boolean(selectedRating)}
        setIsOpen={(isOpen: boolean) => {
          if (!isOpen) setSelectedRating(null);
        }}
        onUpdated={loadUserRatings}
      />
    </div>
  );
}
