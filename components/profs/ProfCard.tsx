"use client";
import {
  Avatar,
  Card,
  CardBody,
  Chip,
  useDisclosure,
} from "@nextui-org/react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ProfessorDetailsModal from "./ProfessorDetailsModal";

export default function ProfCard(props: any) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const getUniqueSubjects = (courses: any) => {
    return Array.from(
      new Set(courses?.map((course: any) => course.subject).filter(Boolean))
    ) as string[];
  };

  const subjects = getUniqueSubjects(props.prof.courses);
  const rating = props.prof.avgRating;
  const ratingColor =
    rating >= 4 ? "success" : rating >= 3 ? "warning" : "danger";
  const displayName = props.prof.displayName.replace("&#39;", "'");

  return (
    <>
      <Card
        as="article"
        isPressable
        key={props.prof.id}
        className="group min-h-48 w-full border border-default-200 bg-content1/80 shadow-sm transition-colors hover:border-primary/30 hover:bg-content2"
        shadow="none"
        onPress={onOpen}
      >
        <CardBody className="flex flex-col gap-5 p-5 text-left">
          <div className="flex items-start gap-4">
            <Avatar
              className="shrink-0 bg-primary/10 text-primary"
              classNames={{
                name: "text-lg font-bold",
              }}
              name={displayName}
              size="lg"
              showFallback
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold tracking-tight text-foreground">
                    {displayName}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-default-500">
                    {props.prof.numRatings}{" "}
                    {props.prof.numRatings === 1 ? "rating" : "ratings"}
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
                  <span className="font-bold">{rating?.toFixed(1)}</span>
                </Chip>
              </div>
            </div>
          </div>

          <div className="flex min-h-7 flex-wrap gap-1.5">
            {subjects.slice(0, 4).map((subject) => (
              <Chip key={subject} size="sm" variant="bordered">
                {subject}
              </Chip>
            ))}
            {subjects.length > 4 ? (
              <Chip size="sm" variant="flat">
                +{subjects.length - 4} more
              </Chip>
            ) : null}
            {subjects.length === 0 ? (
              <span className="text-sm text-default-400">
                No current courses listed
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-default-100 pt-3 text-xs font-semibold text-default-500">
            <span>View ratings and courses</span>
            <ArrowForwardRoundedIcon fontSize="small" />
          </div>
        </CardBody>
      </Card>

      <ProfessorDetailsModal
        professor={props.prof}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
