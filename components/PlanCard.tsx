"use client";
import { Card, Button, CardHeader } from "@nextui-org/react";

import { generateColorFromName } from "../components/primitives";

export default function PlanCard(props: any) {
  return (
    <Card
      key={props.course.id}
      className={
        "bg-light_foreground min-h-14 max-h-14 rounded-sm scroll-none drop-shadow-lg transition-colors mb-3"
      }
      shadow="sm"
    >
      <div
        className={`absolute top-0 left-0 h-full w-2 rounded-full ${generateColorFromName(props.course.subject)}`}
      />

      <CardHeader className="justify-between ">
        <div className="ml-4">
          {props.course.courseTitle.replace(/&amp;/g, "&")}
        </div>
        <Button
          className=""
          size={"sm"}
          isIconOnly
          /*
            onClick={() =>
            removeCourseFromPlan(props.selectedCoursePlan[0], props.course)
          }

            */
        >
          X
        </Button>
      </CardHeader>
    </Card>
  );
}
