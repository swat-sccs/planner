import { Course } from "@prisma/client";
import React, { useState, createContext } from "react";

export const CourseContext = createContext<any>(undefined);

export const CourseContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [courses, setCourses] = useState<Course[]>();

  return (
    <div>
      <CourseContext.Provider value={{ courses, setCourses }}>
        {children}
      </CourseContext.Provider>
    </div>
  );
};
