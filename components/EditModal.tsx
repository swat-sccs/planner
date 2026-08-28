"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import MUIRating from "@mui/material/Rating";
import type { Rating } from "@prisma/client";

import { getYears } from "@/actions/getProfs";

const ratingLabels: Record<number, string> = {
  1: "Awful",
  2: "OK",
  3: "Good",
  4: "Great",
  5: "Awesome",
};

const difficultyLabels: Record<number, string> = {
  1: "Very easy",
  2: "Easy",
  3: "Average",
  4: "Difficult",
  5: "Very difficult",
};

const gradeOptions = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
  "Audit/No Grade",
  "Dropped",
  "Not sure yet",
  "Rather Not Disclose",
];

type EditModalProps = {
  open: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editRating: Rating | null;
  onUpdated?: () => void | Promise<void>;
};

export default function EditModal({
  open,
  setIsOpen,
  editRating,
  onUpdated,
}: EditModalProps) {
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [overallHover, setOverallHover] = useState(-1);
  const [difficultyHover, setDifficultyHover] = useState(-1);
  const [takeAgain, setTakeAgain] = useState(false);
  const [forCredit, setForCredit] = useState(false);
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [review, setReview] = useState("");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editRating) return;

    setOverallRating(editRating.overallRating);
    setDifficulty(editRating.difficulty);
    setTakeAgain(Boolean(editRating.takeAgain));
    setForCredit(Boolean(editRating.forCredit));
    setGrade(editRating.grade || "");
    setReview(editRating.review || "");
    setSemester(
      editRating.termTaken && editRating.yearTaken
        ? `${editRating.termTaken.charAt(0)}${editRating.yearTaken}`
        : ""
    );
    setError("");
  }, [editRating]);

  useEffect(() => {
    if (!open || yearOptions.length > 0) return;
    getYears().then(setYearOptions).catch(console.error);
  }, [open, yearOptions.length]);

  async function updateReview() {
    if (!editRating || !semester) {
      setError("Please select a semester before saving.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/updateReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editRating.id,
          overallRating,
          difficulty,
          takeAgain,
          forCredit,
          grade,
          review,
          termTaken: semester.startsWith("F") ? "Fall" : "Spring",
          yearTaken: Number(semester.slice(1)),
        }),
      });

      if (!response.ok) throw new Error("Unable to update rating");

      await onUpdated?.();
      setIsOpen(false);
    } catch (updateError) {
      console.error(updateError);
      setError("We could not update this rating. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const displayName =
    editRating?.profDisplayName?.replace("&#39;", "'") || "Professor";
  const courseLabel =
    [editRating?.courseSubject, editRating?.courseNumber]
      .filter(Boolean)
      .join(" ") || editRating?.courseName || "Course not listed";

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "max-h-[88vh] border border-default-200 bg-content1",
        wrapper: "overflow-hidden",
      }}
      isDismissable={!isSaving}
      isKeyboardDismissDisabled={isSaving}
      isOpen={open}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSaving) setIsOpen(false);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex shrink-0 flex-col gap-1 border-b border-default-200 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Edit your rating
              </p>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {displayName}
              </h2>
              <p className="text-sm font-normal text-default-500">
                {courseLabel}
              </p>
            </ModalHeader>

            <ModalBody className="gap-5 px-6 py-5 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
              {error ? (
                <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:bg-danger-50/10">
                  {error}
                </div>
              ) : null}

              <section>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-foreground">Semester</h3>
                  {grade ? (
                    <Chip size="sm" variant="flat">
                      Grade {grade}
                    </Chip>
                  ) : null}
                </div>
                <Select
                  isRequired
                  aria-label="Semester"
                  className="max-w-sm"
                  label="Semester taken"
                  selectedKeys={semester ? [semester] : []}
                  onChange={(event) => setSemester(event.target.value)}
                >
                  {yearOptions.map((year) => (
                    <SelectItem key={year}>
                      {year.replace(/^F/, "Fall ").replace(/^S/, "Spring ")}
                    </SelectItem>
                  ))}
                </Select>
              </section>

              <Divider />

              <section className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-default-200 bg-default-50/60 p-4">
                  <p className="text-sm font-bold text-foreground">
                    Overall rating
                  </p>
                  <p className="mb-3 text-xs text-default-500">
                    Your overall experience
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <MUIRating
                      emptyIcon={
                        <StarRoundedIcon
                          fontSize="inherit"
                          style={{ color: "grey", opacity: 0.65 }}
                        />
                      }
                      getLabelText={(value) =>
                        `${value} stars, ${ratingLabels[value]}`
                      }
                      name="edit-overall-rating"
                      value={overallRating}
                      onChange={(_event, value) => setOverallRating(value)}
                      onChangeActive={(_event, value) => setOverallHover(value)}
                    />
                    <span className="text-xs font-semibold text-default-500">
                      {overallRating
                        ? ratingLabels[
                            overallHover !== -1 ? overallHover : overallRating
                          ]
                        : "Not rated"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-default-200 bg-default-50/60 p-4">
                  <p className="text-sm font-bold text-foreground">Difficulty</p>
                  <p className="mb-3 text-xs text-default-500">
                    How challenging was the course?
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <MUIRating
                      emptyIcon={
                        <StarRoundedIcon
                          fontSize="inherit"
                          style={{ color: "grey", opacity: 0.65 }}
                        />
                      }
                      getLabelText={(value) =>
                        `${value} stars, ${difficultyLabels[value]}`
                      }
                      name="edit-difficulty-rating"
                      value={difficulty}
                      onChange={(_event, value) => setDifficulty(value)}
                      onChangeActive={(_event, value) =>
                        setDifficultyHover(value)
                      }
                    />
                    <span className="text-xs font-semibold text-default-500">
                      {difficulty
                        ? difficultyLabels[
                            difficultyHover !== -1
                              ? difficultyHover
                              : difficulty
                          ]
                        : "Not rated"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <Checkbox
                  classNames={{
                    base: "m-0 max-w-none rounded-xl border border-default-200 p-3",
                    label: "w-full",
                  }}
                  isSelected={takeAgain}
                  onValueChange={setTakeAgain}
                >
                  <span className="text-sm font-semibold">
                    I would take this professor again
                  </span>
                </Checkbox>
                <Checkbox
                  classNames={{
                    base: "m-0 max-w-none rounded-xl border border-default-200 p-3",
                    label: "w-full",
                  }}
                  isSelected={forCredit}
                  onValueChange={setForCredit}
                >
                  <span className="text-sm font-semibold">
                    I took this class CR/NC
                  </span>
                </Checkbox>
              </section>

              <Select
                isRequired
                aria-label="Grade"
                className="max-w-sm"
                label="Grade received"
                selectedKeys={grade ? [grade] : []}
                onChange={(event) => setGrade(event.target.value)}
              >
                {gradeOptions.map((option) => (
                  <SelectItem key={option}>{option}</SelectItem>
                ))}
              </Select>

              <Textarea
                disableAutosize
                label="Written review"
                labelPlacement="outside"
                minRows={5}
                placeholder="What did you think of this professor and course?"
                value={review}
                onValueChange={setReview}
              />
            </ModalBody>

            <ModalFooter className="shrink-0 border-t border-default-200 px-6 py-4">
              <Button
                isDisabled={isSaving}
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                isLoading={isSaving}
                startContent={
                  isSaving ? null : <SaveRoundedIcon fontSize="small" />
                }
                onPress={updateReview}
              >
                Save changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
