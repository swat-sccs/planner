"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import { Rating } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";

import { getRatings } from "@/actions/getRatings";

type ProfessorDetailsModalProps = {
  professor: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function ProfessorDetailsModal({
  professor,
  isOpen,
  onOpenChange,
}: ProfessorDetailsModalProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !professor?.uid) return;

    let isCurrent = true;
    setIsLoading(true);

    getRatings(professor.uid)
      .then((results) => {
        if (isCurrent) setRatings(results);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, professor?.uid]);

  const courses = useMemo(() => {
    const uniqueCourses = new Map<string, any>();

    for (const course of professor?.courses || []) {
      const key = `${course.subject}-${course.courseNumber}`;
      if (!uniqueCourses.has(key)) uniqueCourses.set(key, course);
    }

    return Array.from(uniqueCourses.values());
  }, [professor?.courses]);

  const subjects = Array.from(
    new Set(courses.map((course: any) => course.subject).filter(Boolean))
  ) as string[];
  const difficultyRatings = ratings.filter(
    (rating) => rating.difficulty != null
  );
  const averageDifficulty = difficultyRatings.length
    ? difficultyRatings.reduce(
        (total, rating) => total + (rating.difficulty || 0),
        0
      ) / difficultyRatings.length
    : null;
  const takeAgainRatings = ratings.filter(
    (rating) => rating.takeAgain != null
  );
  const takeAgainPercent = takeAgainRatings.length
    ? Math.round(
        (takeAgainRatings.filter((rating) => rating.takeAgain).length /
          takeAgainRatings.length) *
          100
      )
    : null;
  const displayName = professor?.displayName?.replace("&#39;", "'") || "";

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      scrollBehavior="inside"
      size="3xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-4 border-b border-default-200 px-6 py-5">
              <Avatar
                className="shrink-0 bg-primary/10 text-primary"
                classNames={{ name: "text-lg font-bold" }}
                name={displayName}
                size="lg"
                showFallback
              />
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight">
                  {displayName}
                </h2>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {subjects.map((subject) => (
                    <Chip key={subject} size="sm" variant="flat">
                      {subject}
                    </Chip>
                  ))}
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="gap-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="border border-default-200 shadow-none">
                  <CardBody className="gap-1 p-3">
                    <span className="text-xs font-semibold text-default-500">
                      Overall rating
                    </span>
                    <span className="flex items-center gap-1 text-xl font-bold">
                      <StarRoundedIcon className="text-warning" fontSize="small" />
                      {professor?.avgRating?.toFixed(1) || "—"}
                    </span>
                  </CardBody>
                </Card>
                <Card className="border border-default-200 shadow-none">
                  <CardBody className="gap-1 p-3">
                    <span className="text-xs font-semibold text-default-500">
                      Difficulty
                    </span>
                    <span className="text-xl font-bold">
                      {averageDifficulty?.toFixed(1) || "—"}
                    </span>
                  </CardBody>
                </Card>
                <Card className="border border-default-200 shadow-none">
                  <CardBody className="gap-1 p-3">
                    <span className="text-xs font-semibold text-default-500">
                      Would take again
                    </span>
                    <span className="text-xl font-bold">
                      {takeAgainPercent != null ? `${takeAgainPercent}%` : "—"}
                    </span>
                  </CardBody>
                </Card>
                <Card className="border border-default-200 shadow-none">
                  <CardBody className="gap-1 p-3">
                    <span className="text-xs font-semibold text-default-500">
                      Student ratings
                    </span>
                    <span className="text-xl font-bold">
                      {professor?.numRatings ?? ratings.length}
                    </span>
                  </CardBody>
                </Card>
              </div>

              {courses.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold">Courses taught</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {courses.map((course: any) => (
                      <Chip
                        key={`${course.subject}-${course.courseNumber}`}
                        size="sm"
                        variant="bordered"
                      >
                        {course.subject} {course.courseNumber}
                      </Chip>
                    ))}
                  </div>
                </div>
              ) : null}

              <Divider />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold">Student reviews</h3>
                  {!isLoading ? (
                    <span className="text-xs text-default-500">
                      {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
                    </span>
                  ) : null}
                </div>

                {isLoading ? (
                  <div className="grid min-h-40 place-items-center">
                    <Spinner label="Loading reviews" />
                  </div>
                ) : ratings.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {ratings.map((rating) => (
                      <Card
                        className="border border-default-200 bg-default-50 shadow-none"
                        key={rating.id}
                      >
                        <CardBody className="gap-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-bold">
                                {rating.courseSubject} {rating.courseNumber}
                              </div>
                              <div className="text-xs text-default-500">
                                {rating.termTaken} {rating.yearTaken}
                                {rating.grade ? ` · Grade ${rating.grade}` : ""}
                              </div>
                            </div>
                            <Chip
                              color={
                                (rating.overallRating || 0) >= 4
                                  ? "success"
                                  : (rating.overallRating || 0) >= 3
                                    ? "warning"
                                    : "danger"
                              }
                              size="sm"
                              startContent={
                                <StarRoundedIcon
                                  className="ml-0.5"
                                  fontSize="small"
                                />
                              }
                              variant="flat"
                            >
                              {rating.overallRating ?? "—"}
                            </Chip>
                          </div>
                          <p className="text-sm leading-6 text-default-600">
                            {rating.review || "No written review provided."}
                          </p>
                          <div className="text-xs font-medium text-default-500">
                            Difficulty: {rating.difficulty ?? "—"}/5
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="mt-3 border border-dashed border-default-300 shadow-none">
                    <CardBody className="py-8 text-center text-sm text-default-500">
                      No student reviews are available yet.
                    </CardBody>
                  </Card>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-default-200 px-6 py-4">
              <Button variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                as={NextLink}
                className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                href={`/rating?prof=${professor.id}`}
                startContent={<RateReviewRoundedIcon fontSize="small" />}
              >
                Rate this professor
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
