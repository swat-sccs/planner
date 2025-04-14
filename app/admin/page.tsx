"use client";

import { Suspense, useEffect, useState } from "react";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  DateValue,
} from "@nextui-org/react";
import { useCallback } from "react";
import { getUserCount, getPlanCount } from "@/actions/userActions";
import { MoreVert } from "@mui/icons-material";
import axios from "axios";
import { DatePicker } from "@nextui-org/react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import {
  getFirstDayOfSem,
  getLastDayOfSem,
  updateFirstDayOfSem,
  updateLastDayOfSem,
} from "@/actions/actions";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [filtered_ratings, setRatings] = React.useState<any>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  //let columns: any[] | undefined = [];
  const [columns, setColumns] = useState<any>([]);
  const [userCount, setUserCount] = useState<Number>(0);

  const [planCount, setPlanCount] = useState<Number>(0);
  const [first, setFirst] = React.useState<null | undefined | DateValue>();
  const [last, setLast] = React.useState<null | undefined | DateValue>();

  let formatter = useDateFormatter({ dateStyle: "full" });

  function handleFirstChange(newFirst: any) {
    console.log(newFirst);
    setFirst(newFirst);

    updateFirstDayOfSem(
      new Date(newFirst.month + " " + newFirst.day + " " + newFirst.year)
    );
  }
  function handleLastChange(newLast: any) {
    setLast(newLast);
    updateLastDayOfSem(newLast);
  }

  const getData = useCallback(async () => {
    /*
    const theFirst: any = await getFirstDayOfSem();
    const theLast: any = await getLastDayOfSem();
    console.log(theFirst, theLast);
    setFirst(theFirst);
    setLast(theLast);
    */

    setIsLoading(true);
    const data = await fetch("/api/getRatings");
    let usercount = await getUserCount();
    let plancount = await getPlanCount();
    setUserCount(usercount);
    setPlanCount(plancount);
    const ratings = await data.json();
    const the_columns = [];
    setIsLoading(false);

    const the_ratings = [];
    for (let rating of ratings) {
      const name = rating.User?.name;
      const email = rating.User?.email;
      rating.name = name;
      rating.email = email;
      if (!rating.profUid) {
        rating.profUid = "Not defined";
      }

      the_ratings.push(rating);
    }

    if (the_ratings.length > 0) {
      for (let key in the_ratings[0]) {
        if (key != "User") {
          the_columns?.push({ key: key, label: key });
        }
      }
    }
    the_columns?.push({ key: "actions", value: "actions" });
    setRatings(the_ratings);
    setColumns(the_columns);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  async function deleteRating(ratingID: any) {
    console.log("Rating Gone, finito, finished");
    await axios
      .post("/api/deleteRating", {
        ratingID: ratingID,
      })
      .then(function (response) {
        // Handle response
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    getData();
  }

  const renderCell = React.useCallback((user: any, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof any];

    switch (columnKey) {
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVert className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key={columnKey}
                  onPress={() => deleteRating(user.id)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      case "review":
        return <div className="max-h-36 overflow-y-scroll ">{cellValue}</div>;
      default:
        return cellValue;
    }
  }, []);

  if (status === "authenticated") {
    if (session.user?.role === "admin") {
      return isLoading ? (
        <Skeleton className="rounded-md w-[98%] h-48 align-top justify-start mt-10" />
      ) : (
        <>
          <div className="w-full grid grid-rows-1 grid-cols-1 lg:grid-cols-3">
            <h2 className="align-middle">
              User Count: {String(userCount)} Plan Count: {String(planCount)}
            </h2>
            {/* 
            <DatePicker
              className="max-w-[284px]"
              label="First Day of Semester"
              value={first}
              onChange={handleFirstChange}
            />
            <DatePicker
              className="max-w-[284px]"
              label="Last Day of Semester"
              value={last}
              onChange={handleLastChange}
            />
             */}
          </div>

          <Table
            isStriped
            isHeaderSticky
            className="overflow-scroll scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent h-[80vh] p-4"
            fullWidth
            aria-label="Rating table with dynamic content(ratings)"
          >
            <TableHeader columns={columns}>
              {(column: any) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filtered_ratings}
              emptyContent={"No rows to display."}
            >
              {(item: any) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      );
    }
  }
}
