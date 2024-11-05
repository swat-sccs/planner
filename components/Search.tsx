"use client";

import { Input } from "@nextui-org/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";

export default function Search(props: any) {
  let router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTerm, setSelectedTerm]: any = useState(["S2025"]);
  const [selectedDOTW, setSelectedDOTW]: any = useState([]);

  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  });

  const handleSelectionChange = (e: any) => {
    setSelectedTerm([e.target.value]);
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set("term", e.target.value);
    } else {
      params.delete("term");
    }
    replace(`${pathname}?${params.toString()}`);

    //handleSearch();
    //cookies.set("plan", e.target.value);
    //setPlanCookie(e.target.value);
  };

  const handleDOTWChange = (e: any) => {
    //console.log(Array.from(e).join(", "));

    setSelectedDOTW(...[e]);
    const params = new URLSearchParams(searchParams);
    if (e.size > 0) {
      params.set("dotw", Array.from(e).join(","));
    } else {
      params.delete("dotw");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const RenderSelectOptions = () => {
    let output = [];

    for (let i = 0; i < props.terms?.length; i++) {
      let sem = props.terms[i].substring(0, 1);
      let year = props.terms[i].substring(1);
      if (sem.toLowerCase() == "s") {
        output.push({ key: props.terms[i], title: "Spring " + year });
      } else if (sem.toLowerCase() == "f") {
        output.push({ key: props.terms[i], title: "Fall " + year });
      }
    }

    return output
      .sort(function (a: any, b: any) {
        return b.key - a.key;
      })
      .map((term: any) => <SelectItem key={term.key}>{term.title}</SelectItem>);
  };

  return (
    <div className="grid grid-cols-5 gap-5">
      <Input
        isClearable
        className="max-w-xs col-span-2"
        defaultValue={searchParams.get("query")?.toString()}
        label="Search"
        labelPlacement="inside"
        variant="bordered"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
      />

      <Select
        label="Select Term"
        disallowEmptySelection={true}
        className="max-w-xs col-span-1"
        selectedKeys={selectedTerm}
        defaultSelectedKeys={searchParams.get("term")?.toString()}
        selectionMode={"single"}
        onChange={handleSelectionChange}
      >
        {RenderSelectOptions()}
      </Select>
      <Select
        label="Day of the Week"
        className="max-w-xs"
        selectedKeys={selectedDOTW}
        selectionMode="multiple"
        defaultSelectedKeys={searchParams.get("dotw")?.toString()}
        onSelectionChange={handleDOTWChange}
      >
        <SelectItem key={"sunday"}>Sunday</SelectItem>
        <SelectItem key={"monday"}>Monday</SelectItem>
        <SelectItem key={"tuesday"}>Tuesday</SelectItem>
        <SelectItem key={"wednesday"}>Wednesday</SelectItem>
        <SelectItem key={"thursday"}>Thursday</SelectItem>
        <SelectItem key={"friday"}>Friday</SelectItem>
        <SelectItem key={"saturday"}>Saturday</SelectItem>
      </Select>
    </div>
  );
}
