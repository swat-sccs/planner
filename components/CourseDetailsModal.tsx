"use client";

import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  addCourseToPlan,
  getCourseDetails,
  getUserPlanOptions,
} from "@/actions/getStats";

type PlanOption = {
  id: number;
  name: string;
  year: string;
};

type CourseDetailsModalProps = {
  course: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

function decodeDescriptionText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/�/g, " ");
}

function safeLink(href: string) {
  const decodedHref = decodeDescriptionText(href);

  try {
    const url = new URL(decodedHref);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function renderDescription(description: string) {
  const anchors = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  const output: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = anchors.exec(description)) !== null) {
    if (match.index > cursor) {
      output.push(decodeDescriptionText(description.slice(cursor, match.index)));
    }

    const hrefMatch = match[1].match(
      /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    );
    const href = hrefMatch
      ? safeLink(hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || "")
      : null;
    const label = decodeDescriptionText(match[2]);

    output.push(
      href ? (
        <a
          key={`description-link-${match.index}`}
          className="font-semibold text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {label}
        </a>
      ) : (
        label
      )
    );
    cursor = anchors.lastIndex;
  }

  if (cursor < description.length) {
    output.push(decodeDescriptionText(description.slice(cursor)));
  }

  return output;
}

export default function CourseDetailsModal({
  course,
  isOpen,
  onOpenChange,
}: CourseDetailsModalProps) {
  const { data: session } = useSession();
  const [details, setDetails] = useState<any>(course);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addState, setAddState] = useState<
    "idle" | "added" | "no-plan" | "error"
  >("idle");
  const [addedPlanName, setAddedPlanName] = useState("");

  useEffect(() => {
    if (!isOpen || !course?.id) return;

    let isCurrent = true;
    setDetails(course);
    setCourseLoading(!course.subject);
    setPlanOptions([]);
    setAddState("idle");
    setAddedPlanName("");

    Promise.all([getCourseDetails(course.id), getUserPlanOptions()])
      .then(([courseDetails, plans]) => {
        if (!isCurrent) return;
        if (courseDetails) setDetails(courseDetails);
        setPlanOptions(plans);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (isCurrent) setCourseLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [course, isOpen]);

  async function addToPlan(planId: number) {
    if (!details || !session) return;

    setIsAdding(true);
    setAddState("idle");

    try {
      const result = await addCourseToPlan(details.id, planId);
      const plan = planOptions.find((option) => option.id === planId);

      if (result.ok) {
        setAddedPlanName(plan?.name || "plan");
        setAddState("added");
      } else {
        setAddState(result.reason === "not-found" ? "no-plan" : "error");
      }
    } catch (error) {
      console.error(error);
      setAddState("error");
    } finally {
      setIsAdding(false);
    }
  }

  function formatMeetingTime(time?: string) {
    if (!time) return "";
    return moment(time, "HHmm").format("h:mm A");
  }

  function meetingDays(meetingTime: any) {
    if (!meetingTime) return "Schedule unavailable";

    const days = [
      ["Mon", meetingTime.monday],
      ["Tue", meetingTime.tuesday],
      ["Wed", meetingTime.wednesday],
      ["Thu", meetingTime.thursday],
      ["Fri", meetingTime.friday],
      ["Sat", meetingTime.saturday],
      ["Sun", meetingTime.sunday],
    ];

    return (
      days
        .filter(([, meets]) => meets)
        .map(([day]) => day)
        .join(", ") || "Schedule unavailable"
    );
  }

  return (
    <Modal
      classNames={{
        wrapper: "!fixed !inset-0 !overflow-hidden",
        base: "!m-0 h-[92dvh] max-h-[92dvh] overflow-hidden",
        body: "!overflow-hidden",
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      scrollBehavior="inside"
      shouldBlockScroll
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200 px-6 py-5">
              <span className="text-xl font-bold tracking-tight">
                {details?.courseTitle?.replace("&amp;", "&") ||
                  "Course details"}
              </span>
              {details?.subject ? (
                <span className="text-sm font-medium text-default-500">
                  {details.subject} {details.courseNumber}
                </span>
              ) : null}
            </ModalHeader>

            <ModalBody className="min-h-0 gap-5 overflow-hidden px-6 py-5">
              {courseLoading && !details?.subject ? (
                <div className="grid min-h-64 place-items-center">
                  <CircularProgress
                    aria-label="Loading course details"
                    label="Loading course details"
                    size="lg"
                  />
                </div>
              ) : details?.subject ? (
                <>
                  <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-default-100 p-3">
                      <div className="text-xs font-semibold text-default-500">
                        Instructor
                      </div>
                      <div className="mt-1 truncate text-sm font-bold">
                        {details.instructor?.displayName?.replace(
                          "&#39;",
                          "'"
                        ) || "TBA"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-default-100 p-3">
                      <div className="text-xs font-semibold text-default-500">
                        Credits
                      </div>
                      <div className="mt-1 text-sm font-bold">
                        {details.creditHours}
                      </div>
                    </div>
                    <div className="rounded-xl bg-default-100 p-3">
                      <div className="text-xs font-semibold text-default-500">
                        Seats available
                      </div>
                      <div className="mt-1 text-sm font-bold">
                        {details.seatsAvailable}
                      </div>
                    </div>
                    <div className="rounded-xl bg-default-100 p-3">
                      <div className="text-xs font-semibold text-default-500">
                        Semester
                      </div>
                      <div className="mt-1 text-sm font-bold">
                        {details.year
                          ?.replace("F", "Fall ")
                          .replace("S", "Spring ")}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-xl border border-default-200 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-default-500">
                      Meeting details
                    </div>
                    <div className="mt-2 font-semibold">
                      {meetingDays(details.facultyMeet?.meetingTimes)}
                      {details.facultyMeet?.meetingTimes?.beginTime ? (
                        <>
                          {" "}·{" "}
                          {formatMeetingTime(
                            details.facultyMeet.meetingTimes.beginTime
                          )}
                          {" – "}
                          {formatMeetingTime(
                            details.facultyMeet.meetingTimes.endTime
                          )}
                        </>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-default-500">
                      {details.facultyMeet?.meetingTimes
                        ?.buildingDescription || "Location TBA"}
                      {details.facultyMeet?.meetingTimes?.room
                        ? ` ${details.facultyMeet.meetingTimes.room}`
                        : ""}
                    </div>
                  </div>

                  {details.sectionAttributes?.length > 0 ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {details.sectionAttributes.map((attribute: any) => (
                        <Chip
                          key={attribute.id}
                          color="primary"
                          size="sm"
                          variant="flat"
                        >
                          {attribute.code}
                        </Chip>
                      ))}
                    </div>
                  ) : null}

                  <Divider className="shrink-0" />

                  <div className="flex min-h-0 flex-1 flex-col">
                    <h3 className="shrink-0 font-bold">Course description</h3>
                    <div className="mt-2 min-h-0 flex-1 overscroll-contain overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
                      <p className="whitespace-pre-line text-sm leading-6 text-default-600">
                        {details.description
                          ? renderDescription(details.description)
                          : "No course description is currently available."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-default-500">
                  Course details could not be loaded.
                </div>
              )}
            </ModalBody>

            <ModalFooter className="shrink-0 border-t border-default-200 px-6 py-4">
              <div className="mr-auto self-center text-sm text-default-500">
                {!session
                  ? "Sign in to add courses to a plan."
                  : !courseLoading && planOptions.length === 0
                    ? "Create a plan before adding this course."
                    : addState === "no-plan"
                      ? "That plan is no longer available."
                      : addState === "error"
                        ? "The course could not be added. Please try again."
                        : ""}
              </div>
              <Button variant="light" onPress={onClose}>
                Close
              </Button>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    className={
                      addState === "added"
                        ? "!bg-emerald-500 !text-white dark:!bg-emerald-400 dark:!text-slate-950"
                        : "!bg-[#f46523] !text-white shadow-md shadow-orange-950/15 hover:!bg-[#dc571d] dark:!bg-orange-400 dark:!text-slate-950 dark:hover:!bg-orange-300"
                    }
                    isDisabled={
                      !session ||
                      courseLoading ||
                      !details?.subject ||
                      planOptions.length === 0
                    }
                    isLoading={isAdding}
                    startContent={
                      addState === "added" ? (
                        <CheckCircleOutlineIcon fontSize="small" />
                      ) : (
                        <AddCircleOutlineIcon fontSize="small" />
                      )
                    }
                    endContent={<KeyboardArrowDownIcon fontSize="small" />}
                  >
                    {addState === "added"
                      ? `Added to ${addedPlanName}`
                      : "Add to plan"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Choose a plan for this course"
                  items={planOptions}
                  onAction={(key) => addToPlan(Number(key))}
                >
                  {(plan) => (
                    <DropdownItem
                      key={plan.id}
                      description={plan.year
                        .replace("F", "Fall ")
                        .replace("S", "Spring ")}
                    >
                      {plan.name}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
