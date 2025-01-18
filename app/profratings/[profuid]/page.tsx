"use client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@nextui-org/react";
import Star from "@mui/icons-material/Star";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Faculty, Rating } from "@prisma/client";
import { getProfs, getNumRatings, getProfsByUid } from "app/actions/getProfs";
import { getRatings } from "app/actions/getRatings";
import StarRating from "@mui/material/Rating";

export default function Page({
  params,
}: {
  params: Promise<{ profuid: string }>;
}) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [profInfo, setProfInfo] = useState<Faculty | null>();

  const getData = useCallback(async () => {
    const slug = (await params).profuid;
    const theratings = await getRatings(slug);
    const theProfInfo = await getProfsByUid(slug);
    setRatings(theratings);
    setProfInfo(theProfInfo);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="px-2 mt-4">
      <div className="text-xl mb-5 font-bold">{profInfo?.displayName}</div>
      <div className="gap-3 flex-col grid lg:grid-cols-2 lg:grid-cols1 mt-5 px-3">
        {ratings?.map((rating: Rating) => (
          <Card key={rating.id} className="p-2">
            <CardHeader className="font-semibold">
              {rating.courseSubject} {rating.courseNumber}
            </CardHeader>

            <CardBody>
              <div>Overall: </div>
              <StarRating
                className="ml-5"
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

              <div>Difficulty: </div>
              <StarRating
                className="ml-5"
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
              <div className="mt-10">{rating.review}</div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
