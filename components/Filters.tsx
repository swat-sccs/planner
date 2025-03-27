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
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useCookies } from "next-client-cookies";

import { setPlanCookie } from "../app/actions/actions";
import { generateColorFromName } from "./primitives";
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
  removeCourseFromDBPlan,
} from "app/actions/getCourses";
import { Course, CoursePlan } from "@prisma/client";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import moment from "moment";

export default function Filters(props: any) {
  const cookies = useCookies();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [dotw, setdotw] = useState<any>([]);
  const [selectedTerm, setSelectedTerm]: any = useState([]);
  const [selectedStartTime, setSelectedStartTime]: any = useState([]);

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const handleSelectionChange = (e: any) => {
    setSelectedTerm([e.target.value]);

    if (e.target.value) {
      params.set("term", e.target.value);
      cookies.set("termCookie", e.target.value);
    } else {
      params.delete("term");
    }
    replace(`${pathname}?${params.toString()}`);

    //handleSearch();
    //cookies.set("plan", e.target.value);
    //setPlanCookie(e.target.value);
  };

  const days = [
    { key: "sunday", label: "Sunday" },
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
  ];
  const inputStyle = {
    trigger: [
      "shadow-xl",
      "bg-light_foreground",
      "dark:bg-light_foreground",
      "backdrop-blur-xl",
      "backdrop-saturate-200",
      "hover:bg-light_foreground/10",
      "dark:hover:bg-light_foreground/70",
      "group-data-[focus=true]:bg-default-200/50",
      "dark:group-data-[focus=true]:bg-default/60",
    ],
    innerWrapper: "bg-transparent",
  };

  const handleDOTWChange = (e: any) => {
    setdotw(e);

    if (e.length > 0) {
      params.set("dotw", e);
    } else {
      params.delete("dotw");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSTimeChange = (e: any) => {
    setSelectedStartTime(e);

    if (e.length > 0) {
      params.set("stime", e);
    } else {
      params.delete("stime");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const RenderSelectOptions = () => {
    const output = [];

    for (let i = 0; i < props.terms?.length; i++) {
      let terms = props.terms?.sort((a: any, b: any) => {
        // Extract the prefix (f or s) and year (e.g., 2025, 2024) from each string
        const yearA = parseInt(a.slice(1)); // Get year part from 'f2025' or 's2024'
        const yearB = parseInt(b.slice(1)); // Get year part from 'f2025' or 's2024'

        // Define the sorting order based on the prefix and year
        if (yearA === yearB) {
          return a.charAt(0).localeCompare(b.charAt(0)); // Sort by 'f' and 's' if years are the same
        }

        // Sort by year (higher years come first)
        return yearB - yearA;
      });

      const sem = terms[i].substring(0, 1);
      const year = terms[i].substring(1);

      if (sem.toLowerCase() == "s") {
        output.push({ key: props.terms[i], title: "Spring " + year });
      } else if (sem.toLowerCase() == "f") {
        output.push({ key: props.terms[i], title: "Fall " + year });
      }
    }

    return output.map((term: any) => (
      <SelectItem key={term.key}>{term.title}</SelectItem>
    ));
  };

  const firstLoad = useCallback(async () => {
    let termCookie = cookies.get("termCookie");
    let searchTermCookie = cookies.get("searchTermCookie");

    setdotw(searchParams.get("dotw")?.toString().split(","));
    // setSelectedStartTime(searchParams.get("stime")?.toString().split(","));
    if (!termCookie) {
      cookies.set("termCookie", props.terms[0]);
      //params.set("term", props.terms[0]);
      replace(`${pathname}?${params.toString()}`);
      setSelectedTerm([props.terms[0]]);
    } else {
      params.set("term", termCookie);
      await replace(`${pathname}?${params.toString()}`);
      setSelectedTerm([termCookie]);
    }
  }, []);

  useEffect(() => {
    // Update the document title using the browser API
    firstLoad();
  }, [firstLoad]);

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <Select
          className=""
          classNames={inputStyle}
          size={"sm"}
          label="Select Term"
          selectedKeys={selectedTerm}
          selectionMode={"single"}
          disallowEmptySelection
          onChange={handleSelectionChange}
        >
          {RenderSelectOptions()}
        </Select>

        <Divider className="mt-5 w-50" />

        {props.mobile ? (
          <div className="grid grid-cols-2 h-60 overflow-y-clip">
            <div>
              <div className="mt-5 font-semibold mb-2">Days of the Week</div>
              <CheckboxGroup value={dotw} onValueChange={handleDOTWChange}>
                {days.map((day: any) => (
                  <Checkbox key={day.key} color="primary" value={day.key}>
                    {day.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>

            <div>
              <div className="mt-5 font-semibold mb-2">Start Time</div>
              <CheckboxGroup
                value={selectedStartTime}
                onValueChange={handleSTimeChange}
                className="lg:max-h-72 overflow-y-scroll h-48"
              >
                {props.times.startTimes.map((startTime: any) => {
                  const time = startTime.slice(0, 2) + ":" + startTime.slice(2);
                  const daTime = moment(time, "HH:mm").format("hh:mm A");

                  return (
                    <Checkbox
                      color="secondary"
                      key={startTime}
                      value={startTime}
                    >
                      {daTime}
                    </Checkbox>
                  );
                })}
              </CheckboxGroup>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 font-semibold">Days of the Week</div>
            <CheckboxGroup value={dotw} onValueChange={handleDOTWChange}>
              {days.map((day: any) => (
                <Checkbox key={day.key} color="primary" value={day.key}>
                  {day.label}
                </Checkbox>
              ))}
            </CheckboxGroup>

            <div className="mt-5 font-semibold">Start Time</div>
            <CheckboxGroup
              value={selectedStartTime}
              onValueChange={handleSTimeChange}
              className="lg:max-h-72 max-h-[12vh] overflow-y-scroll"
            >
              {props.times.startTimes.map((startTime: any) => {
                const time = startTime.slice(0, 2) + ":" + startTime.slice(2);
                const daTime = moment(time, "HH:mm").format("hh:mm A");

                return (
                  <Checkbox color="secondary" key={startTime} value={startTime}>
                    {daTime}
                  </Checkbox>
                );
              })}
            </CheckboxGroup>
          </>
        )}
      </div>
    </>
  );
}
