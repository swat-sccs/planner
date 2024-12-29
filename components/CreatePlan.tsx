"use client";
import { Card, Divider, Input, Skeleton, CardHeader } from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import axios from "axios";
import { Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { useCookies } from "next-client-cookies";

import { setPlanCookie } from "../app/actions/actions";
import { generateColorFromName } from "../components/primitives";
import { useDebouncedCallback } from "use-debounce";
import { setPlanName } from "../app/actions/setPlanName";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";

import {
  getCourseIds,
  getCoursePlans,
  getPlanCourses1,
  removeCourseFromDBPlan,
} from "app/actions/getCourses";
import { Course, CoursePlan } from "@prisma/client";
export default function CreatePlan(props: any) {
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
  const [courses, setCourses] = useState<Course[]>();
  const [coursePlans, setCoursePlans] = useState<CoursePlan[]>(
    props.coursePlans
  );
  const [planItems, setPlanItems] = useState([]);
  const [selectedCoursePlan, setSelectedCoursePlan]: any = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const fetcher = (url: any) => fetch(url).then((r) => r.json());

  const fetchNewData = async (b: any) => {
    const coursePlans: CoursePlan[] = await getCoursePlans();
    setCoursePlans(coursePlans);
    genreatePlanList(coursePlans);

    if (b && coursePlans.length > 0) {
      console.log("deleted generating new list");
      setSelectedCoursePlan([coursePlans[0].id]);
      setPlanCookie(String(coursePlans[0].id));
      genreatePlanList(coursePlans);
    }
  };

  const handleNameChange = useDebouncedCallback((newName: any, id: string) => {
    setPlanName(newName, id);
    fetchNewData(false);
  }, 50);

  async function createPlan() {
    if (coursePlanName) {
      setAlert(undefined);
      await axios
        .post("/api/createplan", {
          planName: coursePlanName,
        })
        .then(function (response: any) {
          setCoursePlanName("");
          setSelectedCoursePlan([response.data.id]);
          setPlanCookie(response.data.id);
          fetchNewData(false);
          //console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setAlert("A name is required to create a course plan.");
    }
  }
  async function updateLocalPlan() {
    const planCourses: any = await getPlanCourses1();
    if (planCourses) {
      setCourses(planCourses?.courses);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    //router.refresh();
  }
  async function removeCourseFromPlan(plan: any, course: any) {
    await removeCourseFromDBPlan(course);
    await updateLocalPlan();
    router.refresh();
  }
  async function deletePlan() {
    if (cookies.get("plan")) {
      axios
        .delete("/api/createplan", {
          data: {
            planId: cookies.get("plan"),
          },
        })
        .then(function (response) {
          setSelectedCoursePlan([]);
          setCourses([]);
          fetchNewData(true);
          //setPlanCookie("-55");
          //console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  const handleSelectionChange = (e: any) => {
    //console.log(e.target.value);
    setSelectedCoursePlan([e.target.value]);
    //cookies.set("plan", e.target.value);
    setPlanCookie(e.target.value);
  };

  useEffect(() => {
    updateLocalPlan();
    genreatePlanList(props.coursePlans);
  }, [props.initialPlan, props.coursePlans, cookies.get("selectedCourses")]);

  useEffect(() => {
    setSelectedCoursePlan([cookies.get("plan")]);
    if (props.initialPlan && props.initialPlan.length > 0) {
      if (props.initialPlan.courses && props.initalPlan.courses.length > 0) {
        setCourses(props.initialPlan.courses);
      }
    }
  }, [props.initialPlan, cookies.get("plan")]);

  const CoursesList = () => {
    const output: any = [];

    if (courses && courses != undefined) {
      return courses.map((course: any) => (
        <Card
          aria-label={course.courseTitle}
          key={course.id}
          className={
            "bg-light_foreground min-h-16 max-h-16 rounded-sm scroll-none drop-shadow-lg transition-colors"
          }
          shadow="sm"

          // onClick={() => removeCourseFromPlan(selectedCoursePlan, course)}
        >
          <div
            className={`absolute top-0 left-0 h-full w-2 rounded-full ${generateColorFromName(course.subject)}`}
          />

          <CardHeader className="justify-between">
            <div className="ml-2 lg:text-base truncate text-bold">
              {course.subject} {""} {course.courseNumber}
              <div className="text-tiny ">
                {course.courseTitle.replace(/&amp;/g, "&")}
              </div>
            </div>

            <Button
              aria-label={"Remove " + course.courseTitle + " from plan"}
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
    console.log("A");
    if (scrollRef.current) {
      console.log("B");
      scrollRef.current.scrollIntoView({ behavior: "smooth", inline: "start" });
      setIsScrolled(true);
    }
  };

  const scrollToTop = () => {
    console.log("C");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setIsScrolled(false);
  };

  const genreatePlanList = (plans: any) => {
    let output: any = [];
    output.push();

    plans?.map((plan: any) => output.push({ key: plan.id, label: plan.name }));

    setPlanItems(output);
  };

  return (
    <>
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
                onClick={() => createPlan()}
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
                  onClick={() => setEdit(false)}
                  startContent={<SaveIcon />}
                />
              ) : (
                <Button
                  aria-label="Edit name of course plan"
                  isIconOnly
                  size="md"
                  onClick={() => {
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

        <div
          className="flex flex-col h-[45vh] overflow-y-scroll gap-3 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent"
          id="scrollMe"
          ref={scrollRef}
          aria-label="List of Courses in plan"
        >
          <CoursesList />
        </div>
      </div>
    </>
  );
}
