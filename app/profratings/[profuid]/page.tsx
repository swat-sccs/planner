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
import { getProfs, getNumRatings } from "app/actions/getProfs";
import { getRatings } from "app/actions/getRatings";
import StarRating from "@mui/material/Rating";

export default function Page({
  params,
}: {
  params: Promise<{ profuid: string }>;
}) {
  const [ratings, setRatings] = useState<Rating[]>([]);

  const getData = useCallback(async () => {
    const slug = (await params).profuid;
    const theratings = await getRatings(slug);
    setRatings(theratings);
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="px-2 mt-4">
      {ratings?.map((rating: Rating) => (
        <Card key={rating.id}>
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
  );
}
