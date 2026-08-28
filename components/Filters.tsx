"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  CheckboxGroup,
  Chip,
  Divider,
  Select,
  SelectItem,
} from "@nextui-org/react";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCookies } from "next-client-cookies";
import moment from "moment";

const days = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
];

const selectClassNames = {
  trigger:
    "border border-default-200 bg-default-50 shadow-none hover:bg-default-100",
};

export default function Filters(props: any) {
  const cookies = useCookies();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [selectedTerm, setSelectedTerm] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedStartTimes, setSelectedStartTimes] = useState<string[]>([]);
  const [selectedDistributions, setSelectedDistributions] = useState<string[]>(
    []
  );

  const termOptions = useMemo(
    () =>
      [...(props.terms || [])]
        .sort((a: string, b: string) => {
          const yearDifference = Number(b.slice(1)) - Number(a.slice(1));
          return yearDifference || a.charAt(0).localeCompare(b.charAt(0));
        })
        .map((term: string) => ({
          key: term,
          label: term.replace(/^F/i, "Fall ").replace(/^S/i, "Spring "),
        })),
    [props.terms]
  );

  useEffect(() => {
    setSelectedDays(searchParams.get("dotw")?.split(",").filter(Boolean) || []);
    setSelectedStartTimes(
      searchParams.get("stime")?.split(",").filter(Boolean) || []
    );
    setSelectedDistributions(
      searchParams.get("dist")?.split(",").filter(Boolean) || []
    );

    const urlTerm = searchParams.get("term");
    const savedTerm = cookies.get("termCookie");
    const nextTerm = urlTerm || savedTerm || termOptions[0]?.key;
    setSelectedTerm(nextTerm ? [nextTerm] : []);

    if (!urlTerm && nextTerm) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("term", nextTerm);
      cookies.set("termCookie", nextTerm);
      replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, termOptions, cookies, pathname, replace]);

  function updateParam(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) params.set(key, values.join(","));
    else params.delete(key);
    replace(`${pathname}?${params.toString()}`);
  }

  function handleTermChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextTerm = event.target.value;
    setSelectedTerm(nextTerm ? [nextTerm] : []);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTerm) {
      params.set("term", nextTerm);
      cookies.set("termCookie", nextTerm);
    }
    replace(`${pathname}?${params.toString()}`);
  }

  const activeCount =
    selectedDays.length +
    selectedStartTimes.length +
    selectedDistributions.length;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 px-1 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TuneRoundedIcon className="text-primary" fontSize="small" />
            <h2 className="text-sm font-bold text-foreground">Filters</h2>
          </div>
          <Chip size="sm" variant={activeCount > 0 ? "flat" : "bordered"}>
            {activeCount} active
          </Chip>
        </div>

        <Select
          classNames={selectClassNames}
          disallowEmptySelection
          label="Semester"
          selectedKeys={selectedTerm}
          selectionMode="single"
          size="sm"
          onChange={handleTermChange}
        >
          {termOptions.map((term) => (
            <SelectItem key={term.key}>{term.label}</SelectItem>
          ))}
        </Select>

        <Divider />

        <Select
          classNames={selectClassNames}
          label="Days of the week"
          placeholder="Any day"
          selectedKeys={selectedDays}
          selectionMode="multiple"
          size="sm"
          onSelectionChange={(keys) => {
            const values = Array.from(keys).map(String);
            setSelectedDays(values);
            updateParam("dotw", values);
          }}
        >
          {days.map((day) => (
            <SelectItem key={day.key}>{day.label}</SelectItem>
          ))}
        </Select>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-default-500">
              Distribution
            </h3>
            <span className="text-xs text-default-400">
              {selectedDistributions.length || "Any"}
            </span>
          </div>
          <CheckboxGroup
            className="max-h-36 overflow-y-scroll pr-1 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent"
            value={selectedDistributions}
            onValueChange={(values) => {
              setSelectedDistributions(values);
              updateParam("dist", values);
            }}
          >
            {(props.distributions || []).map((distribution: string) => (
              <Checkbox color="primary" key={distribution} value={distribution}>
                <span className="text-sm">{distribution}</span>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </section>

        <Divider />

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-default-500">
              Start time
            </h3>
            <span className="text-xs text-default-400">
              {selectedStartTimes.length || "Any"}
            </span>
          </div>
          <CheckboxGroup
            className="max-h-[12vh] overflow-y-scroll pr-1 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent lg:max-h-72"
            value={selectedStartTimes}
            onValueChange={(values) => {
              setSelectedStartTimes(values);
              updateParam("stime", values);
            }}
          >
            {props.times.startTimes.map((startTime: string) => (
              <Checkbox color="secondary" key={startTime} value={startTime}>
                <span className="text-sm">
                  {moment(startTime, "HHmm").format("h:mm A")}
                </span>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </section>
      </div>
    </div>
  );
}
