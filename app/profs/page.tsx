"use client";

import { useCallback, useEffect, useState } from "react";
import React from "react";
import ProfCard from "../../components/profs/ProfCard";
import {
  getProfs,
  getUniqueProfsWithRatings,
  searchProfs,
} from "../../app/actions/getProfs";
import { Faculty } from "@prisma/client";
import { useRouter } from "next/navigation";
import Search from "@/components/Search";
import Filters from "@/components/Filters";

export default function ProfPage(props: any) {
  const [profs, setProfs] = useState<Faculty[]>();

  const loadProfs = useCallback(async () => {
    const searchParams = await props.searchParams;

    const apiProfs = await searchProfs(searchParams?.prof);

    setProfs(apiProfs);
  }, [props.searchParams]);

  useEffect(() => {
    loadProfs();
  }, [loadProfs]);

  return (
    <>
      <div className="grid grid-cols-12 p-3 lg:p-4 lg:py-0 h-full lg:h-[88.8vh] gap-5">
        <div className="col-span-12 lg:hidden w-[98%]">
          <Search mobile={false} />
        </div>
        <div className="col-span-12 gap-3 flex-col grid lg:grid-cols-3 lg:grid-cols1 mt-5 px-3 overflow-x-auto overflow-y-scroll h-[79vh] lg:h-[85vh]">
          {profs?.map((prof: any) => <ProfCard key={prof.id} prof={prof} />)}
        </div>
      </div>
    </>
  );
}
