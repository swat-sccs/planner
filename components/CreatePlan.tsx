"use client";
import {
  Card,
  Divider,
  Input,
  Skeleton,
  CardHeader,
  CardBody,
  Chip,
} from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import axios from "axios";
import { Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";

import { useCookies } from "next-client-cookies";

import { setPlanCookie } from "../app/actions/actions";
import { generateColorFromName } from "../components/primitives";
import { useDebouncedCallback } from "use-debounce";
import { setPlanName } from "../app/actions/setPlanName";
import {
  updateSelectedCoursePlan,
  getSelectedCoursePlan,
} from "../app/actions/userActions";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";

import {
  getCourseIds,
  getCoursePlans,
  getPlanCourses,
  removeCourseFromDBPlan,
} from "app/actions/getCourses";
import { Course, CoursePlan } from "@prisma/client";

interface CreatePlanProps {
  updatePlan: any;
  courses: Course[];
  initialPlan: any;
  coursePlans: any;
  lastSelectedCoursePlan: any;
  auth: any;
}

export default function CreatePlan({
  updatePlan,
  courses,
  initialPlan,
  coursePlans,
  lastSelectedCoursePlan,
  auth,
}: CreatePlanProps) {
  const cookies = useCookies();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [coursePlanName, setCoursePlanName]: any = useState("");
  const [alert, setAlert]: any = useState(undefined);

  const [editable, setEditable]: any = useState("");
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [edit, setEdit]: any = useState(false);
  const [warning, setWarning] = useState<Boolean>(false);

  //const [courses, setCourses] = useState<Course[]>();
  //const [coursePlans, setCoursePlans] = useState<CoursePlan[]>(
  //  props.coursePlans
  //);
  const [planItems, setPlanItems] = useState([]);
  const [selectedCoursePlan, setSelectedCoursePlan]: any = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const fetcher = (url: any) => fetch(url).then((r) => r.json());

  const fetchNewData = async (b: any) => {
    if (auth) {
      const theCoursePlans: CoursePlan[] = await getCoursePlans();
      const courses: any = await getPlanCourses();
      updatePlan(courses?.courses);
      generatePlanList(theCoursePlans);

      if (b && coursePlans?.length > 1) {
        updateSelectedCoursePlan(String(coursePlans[0].id));
        //updatePlan(courses);
        //setPlanCookie(String(coursePlans[0].id));
        //setSelectedCoursePlan([theCoursePlans[0].id]);
        let thing = { target: { value: String(theCoursePlans[0].id) } };
        handleSelectionChange(thing);
      }
    }
  };

  function checkCourses() {
    let terms: any = {};
    if (courses) {
      for (let course of courses) {
        if (terms[course.year] != undefined) {
          terms[course.year] += 1;
        } else {
          terms[course.year] = 0;
        }
      }
      console.log(Object.keys(terms).length);
      if (Object.keys(terms).length > 1) {
        setWarning(true);
      } else {
        setWarning(false);
      }
    }
  }

  const handleNameChange = useDebouncedCallback((newName: any, id: string) => {
    setPlanName(newName, id);
    fetchNewData(false);
  }, 50);

  async function createPlan() {
    if (coursePlanName) {
      setAlert(undefined);
      courses = [];
      await axios
        .post("/api/createplan", {
          planName: coursePlanName,
        })
        .then(async function (response: any) {
          setCoursePlanName("");
          updateSelectedCoursePlan(String(response.data.id));
          //setPlanCookie(response.data.id);
          fetchNewData(false);
          let thing = { target: { value: String(response.data.id) } };
          handleSelectionChange(thing);
          //setSelectedCoursePlan([response.data.id]);

          //console.log(response);
          router.refresh(); //currently refreshing the dom, wonder if there is a more efficent way to re render the course listings
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setAlert("A name is required to create a course plan.");
    }
  }

  async function refreshFromDB() {
    const planCourses: any = await getPlanCourses();
    if (planCourses) {
      updatePlan(planCourses?.courses);
    }
  }

  async function removeCourseFromPlan(plan: any, course: any) {
    const newArray = courses.filter((obj) => obj.id !== course.id); // Remove Course from plan List
    updatePlan(newArray); //Updates the frontend stuff fast
    //Asyncronusly update the db while immediately updating the frontend
    removeCourseFromDBPlan(course).catch((things: any) => {
      refreshFromDB(); //manual db fetch to bring frontend back in sync with backend
    });

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    router.refresh(); //currently refreshing the dom, wonder if there is a more efficent way to re render the course listings
  }

  async function deletePlan() {
    let theSelectedCoursePlan = await getSelectedCoursePlan(session);
    if (theSelectedCoursePlan && coursePlans.length > 0) {
      axios
        .delete("/api/createplan", {
          data: {
            planId: theSelectedCoursePlan,
          },
        })
        .then(function (response) {
          setSelectedCoursePlan([]);
          updateSelectedCoursePlan("-1");
          updatePlan([]);
          fetchNewData(true);
          //setPlanCookie("-55");
          //console.log(response);
          router.refresh(); //currently refreshing the dom, wonder if there is a more efficent way to re render the course listings
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  async function duplicatePlan() {
    let theSelectedCoursePlan = await getSelectedCoursePlan(session);
    if (theSelectedCoursePlan && coursePlans.length > 0) {
      const currentPlan = coursePlans.find(
        (plan: any) => plan.id === parseInt(theSelectedCoursePlan)
      );
      axios
        .post("/api/duplicatePlan", {
          planId: theSelectedCoursePlan,
          planName: `${currentPlan?.name} (Copy)`,
        })
        .then(async function (response: any) {
          updateSelectedCoursePlan(String(response.data.id));
          fetchNewData(false);
          let thing = { target: { value: String(response.data.id) } };
          handleSelectionChange(thing);
          router.refresh();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  const handleSelectionChange = async (e: any) => {
    await updateSelectedCoursePlan(e.target.value);
    setSelectedCoursePlan([e.target.value]);
    refreshFromDB();
    router.refresh(); //currently refreshing the dom, wonder if there is a more efficent way to re render the course listings
  };

  const firstLoad = useCallback(() => {
    if (coursePlans.length > 0) {
      for (let plan of coursePlans) {
        if (lastSelectedCoursePlan != null) {
          if (plan.id == parseInt(lastSelectedCoursePlan)) {
            updatePlan(plan.courses);
            //updateCalEvents(plan.courses);
            setSelectedCoursePlan([lastSelectedCoursePlan]);
          }
        }
      }
    }
    // updateLocalPlan();
    generatePlanList(coursePlans);
  }, [coursePlans, coursePlans, courses]);

  useEffect(() => {
    if (auth) {
      firstLoad();
    }
  }, [initialPlan]);
  useEffect(() => {
    checkCourses();
  }, [courses]);

  const CoursesList = () => {
    if (courses) {
      return courses.map((course: any) => (
        <Card
          aria-label={course?.courseTitle}
          key={course?.id}
          className={
            "bg-light_foreground min-h-16 max-h-16 rounded-sm scroll-none drop-shadow-lg hover:transition-all duration-500 md:hover:translate-y-0.5 ease-in-out md:hover:drop-shadow-none"
          }
          shadow="sm"

          // onClick={() => removeCourseFromPlan(selectedCoursePlan, course)}
        >
          <div
            className={`absolute top-0 left-0 h-full w-2 rounded-full ${generateColorFromName(course?.subject)}`}
          />

          <CardHeader className="justify-between">
            <div className="ml-2 lg:text-base truncate text-bold">
              {course?.subject} {""} {course?.courseNumber} -{" "}
              <div
                className={warning ? "text-red-500 font-bold inline" : "inline"}
              >
                {course?.year.replace(
                  new Date().getFullYear(),
                  course?.year.slice(3)
                )}
              </div>
              <div className="text-tiny ">
                {course?.courseTitle?.replace(/&amp;/g, "&")}
              </div>
            </div>

            <Button
              aria-label={"Remove " + course?.courseTitle + " from plan"}
              isIconOnly
              startContent={<HighlightOffIcon />}
              size={"sm"}
              onPress={() =>
                removeCourseFromPlan(selectedCoursePlan[0], course)
              }
            />
          </CardHeader>
        </Card>
      ));
    }
  };

  const scrollToPlan = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", inline: "start" });
      setIsScrolled(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsScrolled(false);
  };

  const generatePlanList = async (plans: any) => {
    let output: any = [];
    output.push();

    plans?.map((plan: any) => output.push({ key: plan.id, label: plan.name }));

    setPlanItems(output);
  };

  return (
    <>
      <Card
        isBlurred
        className={`w-[92%] lg:w-[23%] h-[83vh] z-20 absolute  ${auth ? "hidden" : null}`}
      >
        <CardBody className="h-full flex flex-col justify-center space-y-10">
          <div className="text-center text-3xl ">
            <h1>Save Your Plans</h1>
            <h1>
              With a <strong>Free </strong>
            </h1>
            <h1>
              <strong className="bg-gradient-to-b to-blue-950 from-orange-600 bg-clip-text text-transparent">
                SCCS
              </strong>{" "}
              Account
            </h1>
          </div>

          <div className=" text-center">
            <Button onPress={() => signIn("keycloak", { callbackUrl: "/" })}>
              <div className="text-xl">Get Started</div>
            </Button>
          </div>
        </CardBody>
      </Card>

      <Button
        className="rounded-full fixed md:hidden bottom-5 right-5 z-20 w-12 h-12 shadow-md"
        color="secondary"
        isIconOnly
        onPress={() => {
          isScrolled ? scrollToTop() : scrollToPlan();
        }}
      >
        <ExpandLessIcon
          className={"transition" + (isScrolled ? " rotate-0" : " rotate-180")}
        />
      </Button>
      <div className="flex flex-col mt-5 lg:mt-0 gap-5">
        <div className="flex flex-col gap-3">
          <div ref={scrollRef}>
            <div className="font-bold text-lg">Create a Plan</div>
            <div className="flex mt-2 items-center gap-2">
              <Input
                isRequired
                label="Plan Name"
                placeholder="Name your plan..."
                size="lg"
                value={coursePlanName}
                onChange={(event: any) => {
                  setCoursePlanName(event.target.value);
                }}
              />
              <Button
                aria-label="Create new plan! Name required."
                startContent={<AddIcon />}
                size="md"
                onPress={() => createPlan()}
              ></Button>
            </div>
            {alert ? (
              <div className="mt-2 text-red-500 text-center">{alert}</div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 items-center">
            <Divider />
            {/* --------------------------------- or --------------------------- */}
            <div className="text-center mt-1">or</div>
            <Divider />
          </div>

          <div>
            <div className="font-bold text-lg">
              {!edit ? "Select a Plan" : "Edit your plan"}
            </div>
            <div className="flex mt-2 items-center justify gap-2">
              {!edit ? (
                <Select
                  className="col-span-3"
                  label="Current Plan"
                  selectedKeys={selectedCoursePlan}
                  selectionMode="single"
                  size="lg"
                  onChange={handleSelectionChange}
                  disallowEmptySelection
                  items={planItems}
                >
                  {
                    /*   {coursePlans?.map((plan: any) => (
                    <SelectItem key={plan.id}>{plan.name}</SelectItem>
                  ))}*/ (plan: any) => (
                      <SelectItem key={plan.key}>{plan.label}</SelectItem>
                    )
                  }
                </Select>
              ) : null}
              {edit ? (
                <Input
                  isRequired
                  label="Edit Plan Name"
                  size="lg"
                  value={editable}
                  onChange={(event: any) => {
                    setEditable(event.target.value),
                      handleNameChange(event.target.value, selectedCoursePlan);
                  }}
                />
              ) : null}

              <Button
                aria-label="Duplicate the current plan"
                isIconOnly
                size="md"
                onPress={() => duplicatePlan()}
                startContent={<ContentCopyIcon />}
              />
              <Popover
                placement="bottom"
                showArrow={true}
                color={"foreground"}
                isOpen={deleteIsOpen}
                onOpenChange={(open) => setDeleteIsOpen(open)}
              >
                <PopoverTrigger>
                  <Button
                    aria-label="Delete the current plan"
                    isIconOnly
                    size="md"
                    startContent={<DeleteIcon />}
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div
                      role="button"
                      onClick={() => {
                        deletePlan(), setDeleteIsOpen(false);
                      }}
                      className="text-small font-bold"
                    >
                      Delete Plan?
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {edit ? (
                <Button
                  aria-label="Save new plan name"
                  isIconOnly
                  size="md"
                  onPress={() => setEdit(false)}
                  startContent={<SaveIcon />}
                />
              ) : (
                <Button
                  aria-label="Edit name of course plan"
                  isIconOnly
                  size="md"
                  onPress={() => {
                    setEdit(true),
                      setEditable(
                        coursePlans?.find(
                          (plan: any) =>
                            plan.id === parseInt(selectedCoursePlan)
                        )?.name
                      );
                  }}
                  startContent={<EditIcon />}
                />
              )}
            </div>
          </div>
        </div>
        {warning && (
          <div className="text-red-600 text-center text-sm">
            <strong>Warning:</strong> Different Semesters Detected
          </div>
        )}

        <div
          className="flex flex-col h-auto mb-20 md:mb-0 md:h-[50vh] overflow-y-scroll gap-3 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent"
          id="scrollMe"
          ref={scrollRef}
          aria-label="List of Courses in plan"
        >
          {courses?.length > 0 ? <CoursesList /> : null}
        </div>
      </div>
    </>
  );
}
