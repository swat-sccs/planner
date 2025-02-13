import {
  getCoursePlans,
  getEvents,
  getPlanCourses,
} from "app/actions/getCourses";
import CoursePlanContext from "@/components/wrappers/CoursePlanContext";
import { getSelectedCoursePlan } from "app/actions/userActions";
import { auth } from "@/lib/auth";

interface Event {
  classNames: string;
  textColor: string;
  title: string;
  daColor: string;
  subject: string;
  courseNumber: string;
  instructor: string;
  room: string;
  color: string;
  borderWidth: string;
  daysOfWeek: (false | "0" | "1" | "2" | "3" | "4" | "5" | "6" | undefined)[];
  startTime: string;
  endTime: string;
}

export default async function CalendarPage(props: any) {
  let endTime = "17:00";
  let startTime = "09:00";
  const session = await auth();

  let planCourses;
  let coursePlans;
  let lastSelectedCoursePlan;
  let theEvents: Event[] = [];

  if (session?.user) {
    planCourses = await getPlanCourses();
    theEvents = await getEvents(planCourses);
    coursePlans = await getCoursePlans();
    lastSelectedCoursePlan = await getSelectedCoursePlan(session);
  }
  /*
  const refreshEvents = useCallback(async () => {
    const theEvents: Event[] = await getEvents();
    setEvents(theEvents);
  }, [theEvents]);

  useEffect(() => {
    refreshEvents();
  }, []);
  */

  //let times = await getUniqueStartEndTimes();
  return (
    <div className="grid grid-cols-12 grid-rows-2 sm:grid-rows-1 p-3 lg:p-4 gap-5">
      <CoursePlanContext
        auth={session}
        calEvents={theEvents}
        startTime={startTime}
        endTime={endTime}
        courseList={false}
        initialPlanCourses={planCourses}
        lastSelectedCoursePlan={lastSelectedCoursePlan}
        coursePlans={coursePlans}
        //refreshEvents={refreshEvents()}
      />
    </div>
  );
}
