"use client";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Select,
  SelectItem,
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Link,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Course, Faculty } from "@prisma/client";
import { useSearchParams } from "next/navigation";

import Person from "@mui/icons-material/Person";
import Class from "@mui/icons-material/Class";
import Star from "@mui/icons-material/Star";

import Rating from "@mui/material/Rating";
import { Alert } from "@nextui-org/alert";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";

import axios from "axios";
import { getUniqueProfs, getYears } from "../../app/actions/getProfs";

const labels: { [index: string]: string } = {
  1: "Awful",
  2: "OK",
  3: "Good",
  4: "Great",
  5: "Awesome",
};
const diffLabels: { [index: string]: string } = {
  1: "Very Easy",
  2: "Easy",
  3: "Average",
  4: "Difficult",
  5: "Very Difficult",
};

const gradeOptions = [
  { key: "A+", label: "A+" },
  { key: "A", label: "A" },
  { key: "A-", label: "A-" },
  { key: "B+", label: "B+" },
  { key: "B", label: "B" },
  { key: "B-", label: "B-" },
  { key: "C+", label: "C+" },
  { key: "C", label: "C" },
  { key: "C-", label: "C-" },
  { key: "D+", label: "D+" },
  { key: "D", label: "D" },
  { key: "D-", label: "D-" },
  { key: "F", label: "F" },
  { key: "Audit/No Grade", label: "Audit/No Grade" },
  { key: "Dropped", label: "Dropped" },
  { key: "Not sure yet", label: "Not sure yet" },
  { key: "Rather Not Disclose", label: "Rather Not Disclose" },
];

function getDiffText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

export default function RatingPage() {
  const searchParams = useSearchParams();
  const [selectedProf, setSelectedProf]: any = useState(null);
  const [selectedClass, setSelectedClass]: any = useState();
  const [rating, setRating] = React.useState<number | null>(0);
  const [hover, setHover] = React.useState(-1);
  const [diffValue, setDiffValue] = React.useState<number | null>(0);
  const [diffHover, setDiffHover] = React.useState(-1);
  const [takeAgain, setTakeAgain] = React.useState(false);
  const [forCredit, setForCredit] = React.useState(false);

  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(false);

  const [grade, setGrade] = React.useState<string>("");
  const [term, setTerm] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const [selectedYearKeys, setSelectedYearKeys] = useState<string>("");
  const [yearOptions, setYearOptions] = React.useState<Array<string>>([]);

  const [review, setReview] = React.useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [profs, setProfs] = useState<Faculty[] | null>(null);

  const [classes, setClasses] = useState<Course[]>();
  const [isLoading, setIsLoading] = useState(true);

  const getData = useCallback(async () => {
    setIsLoading(true);
    const myProfs = await getUniqueProfs();
    const myYears = await getYears();
    setProfs(myProfs);
    setYearOptions(myYears);

    const requestedProfessor = searchParams.get("prof");
    if (requestedProfessor) {
      const professorId = Number(requestedProfessor);
      if (myProfs.some((professor) => professor.id === professorId)) {
        setSelectedProf(professorId);
        const response = await fetch(`/api/getProfClasses?prof=${professorId}`);
        setClasses(await response.json());
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    getData();
  }, [getData]);

  async function onProfSelectionChange(key: any) {
    setSelectedProf(key);
    setSelectedClass(undefined);

    if (key == null) {
      setClasses(undefined);
      return;
    }

    const res: any = await fetch(`/api/getProfClasses?prof=${key}`);
    const fetchedClasses = await res.json();
    setClasses(fetchedClasses);
  }

  const onClassSelectionChange = (key: any) => {
    setSelectedClass(key);
  };
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrade(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYearKeys(e.target.value);
    if (Array.from(e.target.value)[0] == "F") {
      setTerm("Fall");
    }
    if (Array.from(e.target.value)[0] == "S") {
      setTerm("Spring");
    }
    setYear(e.target.value.replace("S", "").replace("F", ""));
  };

  async function submitReview() {
    //Reset all vals to defaults... Send to DB!

    if (
      !year ||
      !term ||
      !selectedClass ||
      !selectedProf ||
      !grade ||
      rating == 0 ||
      diffValue == 0
    ) {
      alert("Please fill out all required fields!");
    } else {
      await axios
        .post("/api/submitReview", {
          courseID: selectedClass,
          facultyID: selectedProf,
          overallRating: rating,
          difficulty: diffValue,
          takeAgain: takeAgain,
          forCredit: forCredit,
          grade: grade,
          review: review,
          termTaken: term,
          yearTaken: year,
        })
        .then(function (response) {
          // Handle response
          setRating(0);
          setDiffValue(0);
          setTakeAgain(false);
          setForCredit(false);
          setSelectedYearKeys("");
          setGrade("");
          setSelectedClass([]);
          setSelectedProf(null);
          setClasses(undefined);
          setReview("");
          setYear(""), setTerm(""), setSubmitSuccess(true);
          setTimeout(() => {
            setSubmitSuccess(false);
          }, 5000);
        })
        .catch(function (error) {
          console.log(error);
          setSubmitError(true);
          setTimeout(() => {
            setSubmitError(false);
          }, 5000);
        });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-5 pt-2 lg:h-[83vh] lg:min-h-0 lg:px-0 lg:pb-0">
      <div className="fixed right-4 top-24 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <Alert
          isVisible={submitSuccess}
          color="success"
          title="Rating submitted"
          description="Thanks for sharing your experience."
        />
        <Alert
          isVisible={submitError}
          color="danger"
          title="Submission failed"
          description="Your rating could not be submitted. Please try again."
        />
      </div>

      <header className="shrink-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Share your experience
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Leave a professor rating
        </h1>
        <p className="mt-1 text-sm text-default-500">
          Help other students make informed course decisions. Required fields
          are marked with an asterisk.
        </p>
      </header>

      <Card className="flex min-h-0 flex-1 overflow-hidden border border-default-200 bg-content1/80 shadow-sm">
        <CardHeader className="shrink-0 border-b border-default-200 px-5 py-3 sm:px-6">
          <div>
            <h2 className="font-bold">Review details</h2>
            <p className="text-xs text-default-500">
              Ratings are anonymous to other students.
            </p>
          </div>
        </CardHeader>

        <CardBody className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent lg:grid-cols-2 lg:overflow-hidden lg:px-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-default-500">
              Course information
            </h3>

            <Autocomplete
              isRequired
              isDisabled={isLoading}
              aria-label="Select Professor"
              label="Professor"
              labelPlacement="outside"
              placeholder="Search professors"
              variant="bordered"
              startContent={<Person className="text-default-400" />}
              selectedKey={selectedProf}
              onSelectionChange={onProfSelectionChange}
            >
              {profs ? (
                profs.map((prof: Faculty) => (
                  <AutocompleteItem key={prof.id} textValue={prof.displayName}>
                    <div className="flex flex-col">
                      <span className="text-small font-medium">
                        {prof.displayName}
                      </span>
                      {prof.avgRating ? (
                        <span className="text-tiny text-default-400">
                          Current rating: {prof.avgRating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </AutocompleteItem>
                ))
              ) : (
                <AutocompleteItem key="loading-professors">
                  <Skeleton className="h-5 w-full rounded-lg" />
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              isRequired
              isDisabled={!classes}
              aria-label="Select Class"
              label="Course"
              labelPlacement="outside"
              placeholder={classes ? "Search courses" : "Select a professor first"}
              variant="bordered"
              startContent={<Class className="text-default-400" />}
              selectedKey={selectedClass}
              onSelectionChange={onClassSelectionChange}
            >
              {classes
                ? classes.map((course: any) => (
                    <AutocompleteItem
                      aria-label={`${course.subject} ${course.courseNumber}`}
                      key={course.id}
                      textValue={`${course.subject} ${course.courseNumber} ${course.courseTitle}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-small font-medium">
                          {course.subject} {course.courseNumber}
                        </span>
                        <span className="text-tiny text-default-400">
                          {course.courseTitle}
                        </span>
                      </div>
                    </AutocompleteItem>
                  ))
                : null}
            </Autocomplete>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                isRequired
                selectionMode="single"
                selectedKeys={[selectedYearKeys]}
                label="Semester taken"
                variant="bordered"
                onChange={handleYearChange}
              >
                {yearOptions.map((year) => (
                  <SelectItem key={year}>
                    {year.replace("F", "Fall ").replace("S", "Spring ")}
                  </SelectItem>
                ))}
              </Select>

              <Select
                isRequired
                selectionMode="single"
                selectedKeys={[grade]}
                label="Grade received"
                variant="bordered"
                onChange={handleSelectionChange}
              >
                {gradeOptions.map((gradeOption) => (
                  <SelectItem key={gradeOption.key}>
                    {gradeOption.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Divider />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-default-200 p-4">
                <div className="text-sm font-bold">Overall rating</div>
                <div className="mt-2 flex items-center gap-3">
                  <Rating
                    name="rate-prof"
                    value={rating}
                    precision={1}
                    getLabelText={getLabelText}
                    onChange={(_event, newValue) => setRating(newValue)}
                    onChangeActive={(_event, newHover) => setHover(newHover)}
                    emptyIcon={
                      <Star
                        style={{ opacity: 0.65, color: "grey" }}
                        fontSize="inherit"
                      />
                    }
                  />
                  <span className="text-xs font-semibold text-default-500">
                    {rating !== null
                      ? labels[hover !== -1 ? hover : rating]
                      : ""}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-default-200 p-4">
                <div className="text-sm font-bold">Course difficulty</div>
                <div className="mt-2 flex items-center gap-3">
                  <Rating
                    name="rate-prof-diff"
                    value={diffValue}
                    precision={1}
                    getLabelText={getDiffText}
                    onChange={(_event, newValue) => setDiffValue(newValue)}
                    onChangeActive={(_event, newHover) =>
                      setDiffHover(newHover)
                    }
                    emptyIcon={
                      <Star
                        style={{ opacity: 0.65, color: "grey" }}
                        fontSize="inherit"
                      />
                    }
                  />
                  <span className="text-xs font-semibold text-default-500">
                    {diffValue !== null
                      ? diffLabels[diffHover !== -1 ? diffHover : diffValue]
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-default-500">
              Your experience
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox
                classNames={{
                  base: "m-0 max-w-none rounded-xl border border-default-200 p-3",
                  label: "w-full",
                }}
                isSelected={takeAgain}
                onValueChange={setTakeAgain}
              >
                <div className="font-semibold">Would take again</div>
                <div className="text-xs text-default-500">
                  Select if you would take this professor again.
                </div>
              </Checkbox>
              <Checkbox
                classNames={{
                  base: "m-0 max-w-none rounded-xl border border-default-200 p-3",
                  label: "w-full",
                }}
                isSelected={forCredit}
                onValueChange={setForCredit}
              >
                <div className="font-semibold">Taken CR/NC</div>
                <div className="text-xs text-default-500">
                  Select if you marked this course CR/NC.
                </div>
              </Checkbox>
            </div>

            <Textarea
              value={review}
              className="min-h-0 flex-1"
              classNames={{
                inputWrapper: "h-full min-h-40",
                input: "h-full min-h-36 resize-none leading-6",
              }}
              labelPlacement="outside"
              label="Written review"
              placeholder="What should other students know about this professor and course?"
              variant="bordered"
              onValueChange={setReview}
            />
          </section>
        </CardBody>

        <CardFooter className="shrink-0 justify-between border-t border-default-200 px-5 py-3 sm:px-6">
          <span className="hidden text-xs text-default-500 sm:block">
            Please keep feedback constructive and course-focused.
          </span>
          <Button
            className="ml-auto bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
            size="lg"
            startContent={<RateReviewRoundedIcon fontSize="small" />}
            onPress={onOpen}
          >
            Review submission
          </Button>
        </CardFooter>
      </Card>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-200">
                Confirm rating submission
              </ModalHeader>
              <ModalBody className="gap-4 py-5 text-sm leading-6 text-default-600">
                <p>
                  By submitting a rating, you agree to the SCCS
                  <Link
                    className="mx-1 font-semibold"
                    isExternal
                    href="https://www.sccs.swarthmore.edu/docs/policy"
                    title="SCCS Usage & Data Policy"
                  >
                    Usage &amp; Data Policy
                  </Link>
                  .
                </p>
                <p>
                  Reviews are anonymous to other students. SCCS retains limited
                  identifying information for platform safety and may remove
                  reviews that violate community expectations.
                </p>
              </ModalBody>
              <ModalFooter className="border-t border-default-200">
                <Button variant="light" onPress={onClose}>
                  Go back
                </Button>
                <Button
                  className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                  onPress={() => {
                    onClose();
                    submitReview();
                  }}
                >
                  Submit rating
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
