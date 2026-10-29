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
import Search from "@/components/Search";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import NextLink from "next/link";

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
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-6 pt-2 lg:h-[88.8vh] lg:min-h-0 lg:px-0 lg:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Community reviews
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Professor ratings
          </h1>
          <p className="mt-1 text-sm text-default-500">
            Browse instructors, their departments, and student ratings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {profs ? (
            <div className="w-fit rounded-full bg-default-100 px-3 py-1.5 text-xs font-semibold text-default-500">
              {profs.length} {profs.length === 1 ? "professor" : "professors"}
            </div>
          ) : null}
          <Button
            as={NextLink}
            className="bg-[#f46523] font-semibold text-white dark:bg-orange-400 dark:text-slate-950"
            href="/rating"
            startContent={<RateReviewRoundedIcon fontSize="small" />}
          >
            Leave a rating
          </Button>
        </div>
      </header>

      <div className="w-full lg:hidden">
        <div className="w-full">
          <Search mobile={false} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
        {!profs ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                className="border border-default-200 bg-content1/80 shadow-sm"
                key={index}
              >
                <CardBody className="flex flex-row items-center gap-4 p-5">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-3">
                    <Skeleton className="h-4 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                    <Skeleton className="h-3 w-2/5 rounded-lg" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : profs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profs.map((prof: any) => (
              <ProfCard key={prof.id} prof={prof} />
            ))}
          </div>
        ) : (
          <Card className="border border-default-200 bg-content1/80 shadow-sm">
            <CardBody className="grid min-h-52 place-items-center text-center">
              <div>
                <h2 className="font-bold text-foreground">
                  No professors found
                </h2>
                <p className="mt-1 text-sm text-default-500">
                  Try a different name in the search field.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
