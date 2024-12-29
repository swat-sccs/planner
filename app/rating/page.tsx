"use client";
import {
  Card,
  CardBody,
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
import { Faculty, Course } from "@prisma/client";

import Person from "@mui/icons-material/Person";
import Class from "@mui/icons-material/Class";
import Star from "@mui/icons-material/Star";

import Rating from "@mui/material/Rating";
import { Alert } from "@nextui-org/alert";

import axios from "axios";
import { getProfs, getUniqueProfs, getYears } from "../../app/actions/getProfs";

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
  const [selectedProf, setSelectedProf]: any = useState(1);
  const [selectedClass, setSelectedClass]: any = useState();
  const [selectedFullClass, setSelectedFullClass] = useState<Course>();
  const [selectedProfessor, setSelectedProfessor] = useState<Faculty>();
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  async function onProfSelectionChange(key: any) {
    setSelectedProf(key);
    const res: any = await fetch(`/api/getProfClasses?prof=${key}`);
    const fetchedClasses = await res.json();
    console.log(fetchedClasses);
    setClasses(fetchedClasses);
  }

  const onClassSelectionChange = (key: any) => {
    setSelectedClass(key);
  };
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrade(e.target.value);
  };
  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTerm(e.target.value);
  };
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
  };

  async function submitReview() {
    //Reset all vals to defaults... Send to DB!

    if (
      !year ||
      !term ||
      !selectedClass ||
      !selectedProf ||
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
          setGrade("");
          setSelectedClass([]);
          setSelectedProf(1);
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
    <>
      <div className="overflow-auto pt-5 sm:pt-0 sm:h-[83vh] h-[80vh]  scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
        <div className="absolute top-30 right-20 bg-transparent w-2/12 z-50 ">
          <Alert
            isVisible={submitSuccess}
            color={"success"}
            title={`Success!`}
            description={"Rating submitted"}
          />
          <Alert
            isVisible={submitError}
            className="absolute top-30 right-20 bg-transparent border-2 w-1/12 "
            color={"danger"}
            title={`Error!`}
            description={"Error submitted rating. Please try again."}
          />{" "}
        </div>

        <Card className="bg-light_foreground mx-10 justify-center items-center sm:w-3/6 flex ml-auto mr-auto w-5/6">
          <CardHeader className="">
            <h1 className=" text-center ml-auto mr-auto col-span-3 row-start-1 row-span-1 text-2xl mb-2 mt-2">
              Leave a Rating
            </h1>
          </CardHeader>
          <CardBody className="flex gap-5 px-4 lg:px-20 w-full">
            <Autocomplete
              isRequired
              aria-label="Select Professor"
              className=" max-w-sm "
              label="Select Professor"
              labelPlacement="outside"
              placeholder="Select Professor"
              variant={"bordered"}
              size="lg"
              startContent={<Person />}
              selectedKey={selectedProf}
              onSelectionChange={onProfSelectionChange}
            >
              {profs ? (
                profs.map((prof: Faculty) => (
                  <AutocompleteItem
                    onPress={() => setSelectedProfessor(prof)}
                    key={prof.id}
                    textValue={prof.displayName}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col">
                        <span className="text-small">{prof.displayName}</span>
                        {prof.avgRating ? (
                          <span className="text-tiny text-default-400">
                            Rating: {prof.avgRating}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </AutocompleteItem>
                ))
              ) : (
                <AutocompleteItem key={"id"}>
                  <Skeleton></Skeleton>
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Autocomplete
              isRequired
              aria-label="Select Class"
              className=" max-w-sm "
              label="Select Class"
              labelPlacement="outside"
              placeholder="Select Class"
              variant={"bordered"}
              size="lg"
              startContent={<Class />}
              selectedKey={selectedClass}
              onSelectionChange={onClassSelectionChange}
            >
              {classes
                ? classes.map((thing: any) => (
                    <AutocompleteItem
                      aria-label={thing.Subject + " " + thing.courseNumber}
                      key={thing.id}
                      textValue={thing.subject + " " + thing.courseNumber}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-col">
                          <span className="text-small">
                            {thing.subject} {thing.courseNumber}
                          </span>
                          <span className="text-tiny text-default-400">
                            {thing.courseTitle}
                          </span>
                        </div>
                      </div>
                    </AutocompleteItem>
                  ))
                : null}
            </Autocomplete>

            <h2>Select Semester</h2>
            <div className="grid-rows-subgrid columns-1 sm:columns-2">
              <Select
                selectionMode="single"
                isRequired
                selectedKeys={[term]}
                placeholder="Select Term"
                className="max-w-sm"
                onChange={handleTermChange}
              >
                <SelectItem key={"Spring"}>Spring</SelectItem>
                <SelectItem key={"Fall"}>Fall</SelectItem>
              </Select>
              <Select
                selectionMode="single"
                isRequired
                selectedKeys={[year]}
                placeholder="Select Year"
                className="max-w-sm mt-5 sm:mt-0"
                onChange={handleYearChange}
              >
                {yearOptions.map((year) => (
                  <SelectItem key={year.replace("F", "").replace("S", "")}>
                    {year.replace("F", "").replace("S", "")}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Divider className="mt-5" orientation="horizontal" />

            <div className="mt-5">Rate Your Professor</div>
            <div className="grid grid-cols-2">
              <Rating
                className="ml-5"
                name="rate-prof"
                value={rating}
                precision={1}
                getLabelText={getLabelText}
                onChange={(event, newValue) => {
                  console.log(newValue);
                  setRating(newValue);
                }}
                onChangeActive={(event, newHover) => {
                  setHover(newHover);
                }}
                emptyIcon={
                  <Star
                    style={{ opacity: 0.8, color: "grey" }}
                    fontSize="inherit"
                  />
                }
              />
              {rating !== null && (
                <div className="ml-5">
                  {labels[hover !== -1 ? hover : rating]}
                </div>
              )}
            </div>

            <div>How difficult was this professor?</div>
            <div className="grid grid-cols-2 mb-5">
              <Rating
                className="ml-5"
                name="rate-prof-diff"
                value={diffValue}
                precision={1}
                getLabelText={getDiffText}
                onChange={(event, newValue) => {
                  console.log(newValue);
                  setDiffValue(newValue);
                }}
                onChangeActive={(event, newHover) => {
                  setDiffHover(newHover);
                }}
                emptyIcon={
                  <Star
                    style={{ opacity: 0.8, color: "grey" }}
                    fontSize="inherit"
                  />
                }
              />
              {diffValue !== null && (
                <div className="ml-5">
                  {diffLabels[diffHover !== -1 ? diffHover : diffValue]}
                </div>
              )}
            </div>

            <div>Would you take this professor again?</div>
            <Checkbox
              className="ml-5"
              isSelected={takeAgain}
              onValueChange={setTakeAgain}
            >
              Yes! <div className="text-tiny">(leave blank for no)</div>
            </Checkbox>

            <div>Did you mark this class as CR/NC?</div>
            <Checkbox
              className="ml-5"
              isSelected={forCredit}
              onValueChange={setForCredit}
            >
              Yes! <div className="text-tiny">(leave blank for no)</div>
            </Checkbox>

            <div>Select grade recieved</div>
            <Select
              selectionMode="single"
              isRequired
              selectedKeys={[grade]}
              placeholder="SelectGrade"
              className="max-w-sm"
              onChange={handleSelectionChange}
            >
              {gradeOptions.map((grade) => (
                <SelectItem key={grade.key}>{grade.label}</SelectItem>
              ))}
            </Select>

            <Textarea
              value={review}
              size="lg"
              className=""
              rows={5}
              labelPlacement="outside"
              disableAutosize
              label="Write a Review"
              placeholder="What did you think of this prof/class?"
              onValueChange={setReview}
            />
          </CardBody>

          <Button
            onPress={onOpen}
            color="primary"
            className="mb-10 mt-10"
            size="lg"
          >
            Submit
          </Button>

          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            backdrop={"blur"}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Confirm Rating Submission
                  </ModalHeader>
                  <ModalBody>
                    <div>
                      By submiting a rating to SCCS you agree to abide by the
                      SCCS
                      <Link
                        className="ml-1 mr-1"
                        isExternal
                        href="https://www.sccs.swarthmore.edu/docs/policy"
                        title="SCCS Usage & Data Policy"
                      >
                        <span className=" underline">
                          {" "}
                          Usage & Data Policy{" "}
                        </span>
                      </Link>
                    </div>

                    <p>
                      While reviews submitted through this site are completly
                      anonymous we collect user identifiable information for the
                      saftey and continued usage of this platform. We do reserve
                      the right to remove reviews that are not in good spirit.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        onClose(), submitReview();
                      }}
                    >
                      Submit
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </Card>
      </div>
    </>
  );
}
