"use client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import { Error } from "@mui/icons-material";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Faculty, Rating } from "@prisma/client";
import { getProfs, getNumRatings } from "app/actions/getProfs";

export default function ProfCard(props: any) {
  const [ratings, setRatings] = useState<any>([]);
  const router = useRouter();
  const getUniqueSubjects = (courses: any) => {
    let output: any = [];
    for (let course of courses) {
      if (!output.includes(course.subject)) {
        output.push(course.subject);
      }
    }

    return output?.map((subj: any) => <div key={subj}>{subj}</div>);
  };

  useEffect(() => {
    // Log the error to an error reporting service
  }, []);

  return (
    <div
      onClick={() => {
        router.push(`/profratings/${props.prof.uid}`);
      }}
    >
      <Card key={props.prof.id} isHoverable shadow="sm">
        <CardHeader className="pl-6">
          <div className="flex items-center flex-row justify-between w-full">
            <div className="flex flex-col">
              <h1 className="font-bold text-md lg:text-2xl text-left">
                {props.prof.displayName.replace("&#39;", "'")}
              </h1>
              <h2 className="flex text-sm lg:text-lg text-left">
                {props.prof.courses?.length > 0
                  ? getUniqueSubjects(props.prof.courses)
                  : null}
              </h2>
            </div>
            <div className="flex items-center">
              <div className="relative h-14 w-14 lg:h-20 lg:w-20 pr-2 lg:pr-3 overflow-clip rounded-md">
                <Image
                  // src={"https://www.swarthmore.edu/sites/default/files/styles/headshot/public/assets/images/user_photos/cmurphy4.jpg.webp"}
                  alt={props.prof.displayName.replace("&#39;", "'")}
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
            {props.prof?.avgRating != null && props.prof.avgRating > 4 ? (
              <div
                className={`flex 0 bg-green-500 w-16 h-16 items-center justify-center rounded-md`}
              >
                <div className="font-black text-3xl">
                  {props.prof.avgRating.toFixed(1)}
                </div>
              </div>
            ) : null}
            {props.prof?.avgRating != null &&
            props.prof.avgRating <= 4 &&
            props.prof.avgRating >= 3 ? (
              <div
                className={`flex 0 bg-green-500 w-16 h-16 items-center justify-center rounded-md`}
              >
                <div className="font-black text-3xl">
                  {props.prof.avgRating.toFixed(1)}
                </div>
              </div>
            ) : null}
            {props.prof?.avgRating != null &&
            props.prof.avgRating < 3 &&
            props.prof.avgRating >= 2 ? (
              <div
                className={`flex 0 bg-orange-500 w-16 h-16 items-center justify-center rounded-md`}
              >
                <div className="font-black text-3xl">
                  {props.prof.avgRating.toFixed(1)}
                </div>
              </div>
            ) : null}
            {props.prof?.avgRating != null && props.prof.avgRating < 2 ? (
              <div
                className={`flex 0 bg-red-500 w-16 h-16 items-center justify-center rounded-md`}
              >
                <div className="font-black text-3xl">
                  {props.prof.avgRating.toFixed(1)}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-2">
            {props.prof.numRatings}{" "}
            {props.prof.numRatings > 1 ? "Ratings" : "Rating"}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
