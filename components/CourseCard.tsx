"use client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import Image from "next/image";
import { tv } from "tailwind-variants";
import axios from "axios";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { generateColorFromName } from "../components/primitives";
import { Error } from "@mui/icons-material";
import { getPlanCookie, setSelectedCookie } from "app/actions/actions";
import { useEffect, useState } from "react";
import { getCourseIds, updateDBPlan } from "app/actions/getCourses";
import { useRouter } from "next/navigation";
import moment from "moment";

export const card = tv({
  slots: {
    base: "hover:cursor-pointer bg-light_foreground min-h-32 max-h-62 w-[98%] rounded-md scroll-none drop-shadow-lg transition-colors",
    role: "font-bold text-primary ",
  },
});

const { base, role } = card();

async function updatePlan(course: any) {
  await updateDBPlan(course);
  setSelectedCookie(course); //Not actually read anywhere but used to refresh the course list

  //console.log("updating");
}

export default function CourseCard(props: any) {
  const color = generateColorFromName(props.course.subject);

  const color_mappings: { [key: string]: string } = {
    "0": "#4CB944",
    "1": "#fb5607",
    "2": "#ff006e",
    "3": "#8338ec",
    "4": "#3a86ff",
  };

  const days = {
    M: props.course.facultyMeet.meetingTimes.monday,
    T: props.course.facultyMeet.meetingTimes.tuesday,
    W: props.course.facultyMeet.meetingTimes.wednesday,
    TH: props.course.facultyMeet.meetingTimes.thursday,
    F: props.course.facultyMeet.meetingTimes.friday,
  };

  const coloredDays = Object.entries(days).map((item, index) => {
    if (item[1]) {
      return (
        <div
          key={index}
          className="flex w-6 h-6 lg:w-8 lg:h-8 rounded-md justify-center items-center"
          style={{ backgroundColor: color_mappings[index] }}
        >
          <p className="font-bold text-sm lg:text-base text-black dark:text-white">
            {item[0]}
          </p>
        </div>
      );
    }

    return null;
  });

  const attributeCodes = props.course.sectionAttributes.map(
    (item: any, index: number) => {
      if (item) {
        return (
          <Chip key={index} size="sm" variant={"bordered"}>
            {" " + item.code + " "}
          </Chip>
        );
      }

      return null;
    }
  );

  return (
    <div onClick={() => updatePlan(props.course)}>
      <Card key={props.course.id} isHoverable className={base()} shadow="sm">
        <div className={`absolute top-0 left-0 h-full z-50 w-2 ${color}`} />
        <CardHeader className="pl-6">
          <div className="flex items-center flex-row justify-between w-full">
            <div className="flex flex-col">
              <h1 className="font-bold text-md lg:text-2xl text-left">
                {props.course.courseTitle.replace("&amp;", "&")}
              </h1>
              <h2 className="flex text-sm lg:text-lg text-left">
                {props.course.subject} {props.course.courseNumber} |{" "}
                {props.course.creditHours} credit(s)
                {props.course.sectionAttributes.length > 0 && (
                  <>
                    <div className="hidden sm:flex flex-row max-w-48 md:max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent grid-cols-6 gap-1">
                      &nbsp;|&nbsp;{attributeCodes}
                    </div>
                  </>
                )}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="relative h-14 w-14 lg:h-20 lg:w-20 pr-2 lg:pr-3 overflow-clip rounded-md">
                <Image
                  // src={"https://www.swarthmore.edu/sites/default/files/styles/headshot/public/assets/images/user_photos/cmurphy4.jpg.webp"}
                  alt={props.course.instructor.displayName.replace(
                    "&#39;",
                    "'"
                  )}
                  fill
                  className="object-cover overflow-clip"
                  sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 15vw"
                  loading={"lazy"}
                  src={
                    "https://cdn.vectorstock.com/i/500p/08/19/gray-photo-placeholder-icon-design-ui-vector-35850819.jpg"
                  }
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-0 pl-6 ">
          <div className="flex justify-between flex-row gap-3">
            <div className="gap-4 basis-1/2">
              {props.course.facultyMeet.meetingTimes.room ? (
                <div className="bg-background_layer shadow-md py-1 px-2 lg:py-2 lg:px-3 w-auto max-w-64 rounded-md">
                  <div className="font-semibold text-sm lg:text-lg text-white">
                    {props.course.facultyMeet.meetingTimes.buildingDescription}{" "}
                    {props.course.facultyMeet.meetingTimes.room}
                  </div>
                  <div className="text-sm lg:text-base text-white">
                    {props.course.facultyMeet.meetingTimes ? (
                      <div className="mt-1">
                        <div className="font-normal">
                          {moment(
                            props.course.facultyMeet.meetingTimes.beginTime.slice(
                              0,
                              2
                            ) +
                              ":" +
                              props.course.facultyMeet.meetingTimes.beginTime.slice(
                                2
                              ),
                            "HH:mm"
                          ).format("hh:mm A")}
                          -{" "}
                          {moment(
                            props.course.facultyMeet.meetingTimes.endTime.slice(
                              0,
                              2
                            ) +
                              ":" +
                              props.course.facultyMeet.meetingTimes.endTime.slice(
                                2
                              ),
                            "HH:mm"
                          ).format("hh:mm A")}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="bg-background_layer shadow-md py-2 px-3 w-auto max-w-64 rounded-md">
                  <p className="text-sm lg:text-base text-white">
                    Contact your Professor for additional details.
                  </p>
                </div>
              )}
              <div className="flex flex-row">
                <div className="flex flex-row gap-2 mt-4">{coloredDays}</div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex flex-row gap-5 justify-end">
                <div>
                  <div className="text-right text-sm lg:text-lg">
                    Instructor
                  </div>
                  <div className="text-right text-md lg:text-2xl font-bold">
                    {props.course.instructor.displayName.replace("&#39;", "'")}
                  </div>
                </div>

                {props.course.instructor.avgRating == null ? null : (
                  <div className="flex bg-green-500 w-16 h-16 items-center justify-center rounded-md">
                    <div className="font-black text-3xl">
                      {props.course.instructor.avgRating}
                    </div>
                  </div>
                )}
              </div>
              {props.course.seatsAvailable == 0 ? (
                <div className="flex flex-row pt-2 gap-2 items-center justify-end">
                  <div className="hidden lg:flex text-md text-slate text-right">
                    No available seats left for this section
                  </div>
                  {/* Use shorter msg for mobile */}
                  <div className="flex lg:hidden text-sm text-slate text-right">
                    No seats
                  </div>
                  <Error color="error" />
                </div>
              ) : (
                <div className="flex flex-row ml-auto pt-1 lg:pt-2 gap-2">
                  <div className="text-sm lg:text-md lg:text-md text-slate text-right">
                    Seats Available: {props.course.seatsAvailable}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
