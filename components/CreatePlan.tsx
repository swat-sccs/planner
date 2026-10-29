"use client";
import {
  Card,
  Divider,
  Input,
  Skeleton,
  CardHeader,
  CardBody,
  Chip,
  Tooltip,
} from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

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
    if (courses && courses.length > 0) {
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
                {course.year.slice(0, 1) + course.year.slice(3)}
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
      <Button
        className="fixed bottom-5 right-5 z-20 h-12 w-12 rounded-full shadow-md md:hidden"
        color="secondary"
        isIconOnly
        onPress={() => {
          isScrolled ? scrollToTop() : scrollToPlan();
        }}
      >
        <ExpandLessIcon
          className={
            "transition-transform" + (isScrolled ? " rotate-0" : " rotate-180")
          }
        />
      </Button>

      {!auth ? (
        <div className="mt-5 h-auto min-h-80 w-full lg:mt-0 lg:h-[83vh]">
          <div className="grid h-full place-items-center px-6 text-center">
            <div className="max-w-xs">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <SchoolRoundedIcon fontSize="large" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Plan builder
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Save your schedule
              </h2>
              <p className="mt-2 text-sm leading-6 text-default-500">
                Sign in with your free SCCS account to create plans and keep
                your courses organized.
              </p>
              <Button
                className="mt-5 bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
                startContent={<LoginRoundedIcon fontSize="small" />}
                onPress={() => signIn("keycloak", { callbackUrl: "/" })}
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 h-auto w-full lg:mt-0 lg:h-[83vh] lg:min-h-0">
          <div className="flex h-full min-h-0 flex-col gap-4 px-1 py-2">
            <div className="shrink-0" ref={scrollRef}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Plan builder
              </p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Your schedule
                </h2>
                <Chip size="sm" variant="flat">
                  {courses?.length || 0}{" "}
                  {courses?.length === 1 ? "course" : "courses"}
                </Chip>
              </div>
            </div>

            <section className="shrink-0 rounded-xl border border-default-200 bg-default-50/60 p-3">
              <h3 className="text-xs font-bold text-default-500">
                Create a plan
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  isRequired
                  aria-label="New plan name"
                  classNames={{ inputWrapper: "bg-content1 shadow-none" }}
                  placeholder="Name your plan"
                  size="sm"
                  value={coursePlanName}
                  onChange={(event) => setCoursePlanName(event.target.value)}
                />
                <Button
                  isIconOnly
                  aria-label="Create new plan"
                  color="primary"
                  size="sm"
                  startContent={<AddIcon />}
                  onPress={createPlan}
                />
              </div>
              {alert ? (
                <p className="mt-2 text-xs font-medium text-danger">{alert}</p>
              ) : null}
            </section>

            <Divider className="shrink-0" />

            <section className="shrink-0">
              <h3 className="text-xs font-bold text-default-500">
                {edit ? "Rename current plan" : "Current plan"}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                {!edit ? (
                  <Select
                    className="min-w-0 flex-1"
                    classNames={{
                      trigger:
                        "border border-default-200 bg-default-50 shadow-none",
                    }}
                    disallowEmptySelection
                    items={planItems}
                    label="Current plan"
                    selectedKeys={selectedCoursePlan}
                    selectionMode="single"
                    size="sm"
                    onChange={handleSelectionChange}
                  >
                    {(plan: any) => (
                      <SelectItem key={plan.key}>{plan.label}</SelectItem>
                    )}
                  </Select>
                ) : (
                  <Input
                    isRequired
                    className="min-w-0 flex-1"
                    label="Plan name"
                    size="sm"
                    value={editable}
                    onChange={(event) => {
                      setEditable(event.target.value);
                      handleNameChange(event.target.value, selectedCoursePlan);
                    }}
                  />
                )}

                <Tooltip content="Duplicate plan" showArrow>
                  <Button
                    isIconOnly
                    aria-label="Duplicate the current plan"
                    size="sm"
                    startContent={<ContentCopyIcon fontSize="small" />}
                    variant="flat"
                    onPress={duplicatePlan}
                  />
                </Tooltip>

                <Tooltip content="Delete plan">
                  <Popover
                    color="foreground"
                    isOpen={deleteIsOpen}
                    placement="bottom"
                    showArrow
                    onOpenChange={setDeleteIsOpen}
                  >
                    <PopoverTrigger>
                      <Button
                        isIconOnly
                        aria-label="Delete the current plan"
                        color="danger"
                        size="sm"
                        startContent={<DeleteIcon fontSize="small" />}
                        variant="light"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col gap-2 px-1 py-2">
                        <p className="text-small font-bold">
                          Delete this plan?
                        </p>
                        <Button
                          color="danger"
                          size="sm"
                          onPress={() => {
                            deletePlan();
                            setDeleteIsOpen(false);
                          }}
                        >
                          Delete plan
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </Tooltip>

                {edit ? (
                  <Button
                    isIconOnly
                    aria-label="Finish renaming plan"
                    color="success"
                    size="sm"
                    startContent={<SaveIcon fontSize="small" />}
                    variant="flat"
                    onPress={() => setEdit(false)}
                  />
                ) : (
                  <Tooltip content="Rename plan" showArrow>
                    <Button
                      isIconOnly
                      aria-label="Rename current plan"
                      size="sm"
                      startContent={<EditIcon fontSize="small" />}
                      variant="flat"
                      onPress={() => {
                        setEdit(true);
                        setEditable(
                          coursePlans?.find(
                            (plan: any) =>
                              plan.id === parseInt(selectedCoursePlan)
                          )?.name || ""
                        );
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            </section>

            {warning ? (
              <div className="shrink-0 rounded-lg bg-danger-50 px-3 py-2 text-center text-xs font-semibold text-danger-600 dark:bg-danger-50/10">
                Different semesters detected
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-2 flex shrink-0 items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-default-500">
                  Planned courses
                </h3>
              </div>
              <div
                aria-label="List of courses in plan"
                className="flex min-h-36 flex-1 flex-col gap-3 overflow-y-scroll pr-1 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent"
                id="scrollMe"
                ref={scrollRef}
              >
                {courses?.length > 0 ? (
                  <CoursesList />
                ) : (
                  <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-default-300 px-4 text-center text-sm text-default-500">
                    Add a course from the results to begin building this plan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
