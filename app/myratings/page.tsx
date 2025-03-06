"use client";
import {
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Select,
  SelectItem,
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Link,
  CardFooter,
  Tooltip,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Faculty, Course } from "@prisma/client";

import EditModal from "../../components/EditModal";

import Person from "@mui/icons-material/Person";
import Class from "@mui/icons-material/Class";

import Star from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import StarRating from "@mui/material/Rating";
import { Alert } from "@nextui-org/alert";

import axios from "axios";
import { getProfs, getUniqueProfs, getYears } from "../../app/actions/getProfs";
import { getUserRatings } from "app/actions/getRatings";
import { Rating } from "@prisma/client";

export default function RatingPage() {
  const [userRatings, setUserRatings]: any = useState();
  const [selectedRating, setSelectedRating] = useState<Rating | any>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  async function loadUserRatings() {
    const theRatings = await getUserRatings();
    setUserRatings(theRatings);
  }

  function showEditModal(rating: Rating) {
    setSelectedRating(rating);
    setIsOpen(true);

    console.log(rating);
  }

  useEffect(() => {
    loadUserRatings();
  }, []);

  return (
    <>
      <div className="px-2 mt-4">
        <div className="text-3xl mx-5 lg:mx-0 mb-5   text-center">
          My Ratings
        </div>

        <EditModal
          open={isOpen}
          editRating={selectedRating}
          setIsOpen={setIsOpen}
        />
        <div className="place-items-center gap-5 lg:gap-y-5 fex-col mx-5 lg:mx-0 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 overflow-y-scroll h-[80vh] scrollbar-col scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
          {userRatings?.map((rating: Rating) => (
            <Card
              key={rating.id}
              className="p-2 dark:bg-light_foreground lg:w-5/6 md:h-[50vh] lg:h-45/6 h-[40vh] "
            >
              <CardHeader className="w-full ">
                <div onClick={() => showEditModal(rating)}>
                  <EditIcon
                    className={`absolute bottom-3 right-3 rounded-3xl `}
                  />
                </div>

                <div className="grid grid-cols-2 w-full justify-between">
                  <div className="col-span-2 font-semibold text-2xl">
                    {" "}
                    {rating.profDisplayName}
                  </div>

                  <div className="col-span-1">
                    {rating.courseSubject} {rating.courseNumber}
                  </div>
                  <div className="col-span-1 justify-self-end">
                    {rating.grade}
                  </div>
                </div>
              </CardHeader>

              <CardBody className="grid grid-cols-2 grid-rows-5 justify-start ">
                <div className=" row-start-1 col-start-1">Overall:</div>
                <StarRating
                  className="ml-5 row-start-1 col-start-2 justify-self-end"
                  name="overall Rating"
                  value={rating.overallRating}
                  precision={1}
                  readOnly
                  emptyIcon={
                    <Star
                      style={{ opacity: 0.8, color: "grey" }}
                      fontSize="inherit"
                    />
                  }
                />

                <div className=" row-start-2 col-start-1">Difficulty: </div>
                <StarRating
                  className="ml-5 row-start-2 col-start-2 justify-self-end"
                  name="overall Rating"
                  value={rating.difficulty}
                  precision={1}
                  readOnly
                  emptyIcon={
                    <Star
                      style={{ opacity: 0.8, color: "grey" }}
                      fontSize="inherit"
                    />
                  }
                />

                <div className="row-start-3 row-span-3 col-span-2  overflow-y-scroll">
                  {rating.review}
                </div>
              </CardBody>
              <CardFooter>
                {rating.termTaken} {rating.yearTaken}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
