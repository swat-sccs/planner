//edit modal for the my ratings page
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
import { Faculty, Course, Rating } from "@prisma/client";

import Person from "@mui/icons-material/Person";
import Class from "@mui/icons-material/Class";
import Star from "@mui/icons-material/Star";

import MUIRating from "@mui/material/Rating";
import { Alert } from "@nextui-org/alert";

import axios from "axios";
import { getProfs, getUniqueProfs, getYears } from "../app/actions/getProfs";
import { CardActions } from "@mui/material";

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

export default function EditModal(props: {
  open: boolean;
  setIsOpen: Function;
  editRating: any;
}) {
  const [selectedProf, setSelectedProf]: any = useState(1);
  const [selectedClass, setSelectedClass]: any = useState();
  const [selectedFullClass, setSelectedFullClass] = useState<Course>();
  const [selectedProfessor, setSelectedProfessor] = useState<Faculty>();
  const [rating, setRating] = React.useState<number | any>(
    props.editRating?.overallRating
  );
  const [hover, setHover] = React.useState(-1);
  const [diffValue, setDiffValue] = React.useState<number | null | any>(
    props.editRating.difficulty
  );
  const [diffHover, setDiffHover] = React.useState<number | null>(
    props.editRating.difficulty
  );
  const [takeAgain, setTakeAgain] = React.useState<any>(
    props.editRating?.takeAgain
  );
  const [forCredit, setForCredit] = React.useState<any>(
    props.editRating?.forCredit
  );

  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(false);

  const [grade, setGrade] = React.useState<string | null | any>(
    props.editRating?.grade
  );
  const [term, setTerm] = React.useState<any>(props.editRating?.termTaken);
  const [year, setYear] = React.useState<string>("");
  const [selectedYearKeys, setSelectedYearKeys] = useState<string>("");
  const [yearOptions, setYearOptions] = React.useState<Array<string>>([]);

  const [review, setReview] = React.useState<any>(props.editRating?.review);

  //const { isOpen, onOpenChange } = useDisclosure();

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
    let thing: any = props.editRating?.termTaken
      ? props.editRating?.termTaken.charAt(0)
      : null;

    setSelectedYearKeys(thing + props.editRating?.yearTaken);

    //setDiffValue(props.editRating?.difficulty);
    //setDiffHover(props.editRating?.difficulty);
  }, [props.editRating]);

  async function onProfSelectionChange(key: any) {
    setSelectedProf(key);
    const res: any = await fetch(`/api/getProfClasses?prof=${key}`);
    const fetchedClasses = await res.json();
    setClasses(fetchedClasses);
  }

  const onClassSelectionChange = (key: any) => {
    setSelectedClass(key);
  };
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.editRating.grade = e.target.value;
    setGrade(e.target.value);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e);
    props.editRating.review = e;
    setReview(e);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // console.log(e.target.value);
    // props.editRating.termTaken;
    // props.editRating.yearTaken;
    //console.log(e.target.value.replace("S", "Spring").replace("F", "Fall"));
    setSelectedYearKeys(e.target.value);
    if (Array.from(e.target.value)[0] == "F") {
      props.editRating.termTaken = "Fall";
      props.editRating.yearTaken = e.target.value.replace("F", "");
      setTerm("Fall");
    }
    if (Array.from(e.target.value)[0] == "S") {
      props.editRating.termTaken = "Spring";
      props.editRating.yearTaken = e.target.value.replace("S", "");
      setTerm("Spring");
    }
    setYear(e.target.value.replace("S", "").replace("F", ""));
  };

  async function updateReview() {
    //Reset all vals to defaults... Send to DB!
    if (!props.editRating) {
      alert("Please fill out all required fields!");
    } else {
      await axios
        .post("/api/updateReview", {
          id: props.editRating.id,
          overallRating: props.editRating.overallRating,
          difficulty: props.editRating.difficulty,
          takeAgain: props.editRating.takeAgain,
          forCredit: props.editRating.forCredit,
          grade: props.editRating.grade,
          review: props.editRating.review,
          termTaken: props.editRating.termTaken,
          yearTaken: props.editRating.yearTaken,
        })
        .then(function (response) {
          // Handle response
          props.setIsOpen(false);
          setRating(0);
          setDiffValue(0);
          setTakeAgain(false);
          setForCredit(false);
          setSelectedYearKeys("");
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
      <div className="absolute top-30 right-20 bg-transparent w-2/12 z-50 ">
        <Alert
          isVisible={submitSuccess}
          color={"success"}
          title={`Success!`}
          description={"Rating updated"}
        />
        <Alert
          isVisible={submitError}
          className="absolute top-30 right-20 bg-transparent border-2 w-1/12 "
          color={"danger"}
          title={`Error!`}
          description={"Error submitted rating. Please try again."}
        />{" "}
      </div>
      <Modal
        isOpen={props.open}
        onOpenChange={() => props.setIsOpen(false)}
        isDismissable={true}
        isKeyboardDismissDisabled={true}
        backdrop={"blur"}
        size={"xl"}
        placement={"center"}
      >
        <ModalContent className="scrollbar bg-light_foreground flex  h-5/6 overflow-y-scroll">
          <ModalHeader>
            <h2 className="text-2xl text-center  ">
              Edit Rating: {props.editRating?.courseName}
            </h2>
          </ModalHeader>

          <ModalBody className="gap-5 px-4 lg:px-20 overflow-y-scroll">
            <h2>Professor: {props.editRating?.profDisplayName}</h2>
            <h2>Course: {props.editRating?.courseName}</h2>

            <h2>Select Semester</h2>
            <div className="grid-rows-subgrid columns-1 sm:columns-2">
              <Select
                selectionMode="single"
                isRequired
                selectedKeys={[selectedYearKeys]}
                className="max-w-sm mt-5 sm:mt-0"
                label="Semester"
                onChange={handleYearChange}
              >
                {yearOptions.map((year) => (
                  <SelectItem key={year}>
                    {year.replace("F", "Fall ").replace("S", "Spring ")}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Divider className="mt-5" orientation="horizontal" />
            <div className="mt-5">Rate Your Professor</div>
            <div className="grid grid-cols-2">
              <MUIRating
                className="ml-5"
                name="rate-prof"
                value={props.editRating.overallRating}
                precision={1}
                getLabelText={getLabelText}
                onChange={(event, newValue) => {
                  props.editRating.overallRating = newValue;
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
              <MUIRating
                className="ml-5"
                name="rate-prof-diff"
                value={props.editRating.difficulty}
                precision={1}
                getLabelText={getDiffText}
                onChange={(event, newValue) => {
                  props.editRating.difficulty = newValue;
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
              isSelected={
                props.editRating?.takeAgain
                  ? props.editRating?.takeAgain
                  : undefined
              }
              onValueChange={setTakeAgain}
            >
              Yes! <div className="text-tiny">(leave blank for no)</div>
            </Checkbox>
            <div>Did you mark this class as CR/NC?</div>
            <Checkbox
              className="ml-5"
              isSelected={
                props.editRating?.takeAgain
                  ? props.editRating?.takeAgain
                  : undefined
              }
              onValueChange={setForCredit}
            >
              Yes! <div className="text-tiny">(leave blank for no)</div>
            </Checkbox>
            <div>Select grade recieved</div>
            <Select
              isRequired
              selectionMode="single"
              selectedKeys={[props.editRating.grade]}
              className="max-w-sm"
              onChange={handleSelectionChange}
              label="Grade"
            >
              {gradeOptions.map((grade) => (
                <SelectItem key={grade.key}>{grade.label}</SelectItem>
              ))}
            </Select>
            <Textarea
              value={props.editRating.review}
              size="lg"
              className=""
              rows={5}
              labelPlacement="outside"
              disableAutosize
              label="Write a Review"
              placeholder="What did you think of this prof/class?"
              onValueChange={(e: any) => handleReviewChange(e)}
            />

            <ModalFooter>
              <Button onPress={updateReview} color="primary" size="lg">
                Update Review
              </Button>
            </ModalFooter>
          </ModalBody>

          {/* 
          <CardActions className="ml-auto">
            <Button onPress={onOpen} color="primary" size="lg">
              Submit
            </Button>
          </CardActions>
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
                      safety and continued usage of this platform. We do reserve
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
          */}
        </ModalContent>
      </Modal>
    </>
  );
}
