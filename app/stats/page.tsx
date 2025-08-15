"use client";
import { cache } from "react";
import { useCallback, useEffect, useState, startTransition } from "react";
import { Bar } from "react-chartjs-2";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  Card,
  CardBody,
  CardFooter,
  CircularProgress,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { getYears } from "@/actions/getProfs";
import { getCourseStats } from "@/actions/getCourses";

import axios from "axios";
import { preload, getItem } from "@/actions/getStats";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function StatsPage(props: any) {
  const router = useRouter();

  const [number, setNumber] = useState<number>(5);
  const [term, setTerm] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [yearterm, setYearTerm] = useState<string>("");
  const [mobile, setIsMobile] = useState<Boolean>(true);

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [data, setData] = useState<any>();

  const [yearOptions, setYearOptions] = useState<Array<string>>([]);
  const [selectedYearKeys, setSelectedYearKeys] = useState<string>("");

  let options = {
    responsive: true,

    scales: {
      x: {
        display: mobile,
      },
    },

    plugins: {
      title: {
        display: true,
        text: "Most Planned Classes",
      },
    },
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYearKeys(e.target.value);
    if (Array.from(e.target.value)[0] == "F") {
      setTerm("Fall");
    }
    if (Array.from(e.target.value)[0] == "S") {
      setTerm("Spring");
    }
    setYearTerm(e.target.value);
    setYear(e.target.value.replace("S", "").replace("F", ""));

    setData(null);
    setIsLoading(true);
    startTransition(() => {
      getItem(e.target.value, number)
        .then((response: any) => {
          setData(response);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  function getNewData(num: number) {
    console.log(yearterm, num);
    startTransition(() => {
      getItem(yearterm, num)
        .then((response: any) => {
          setData(response);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }

  const firstRun = useCallback(async () => {
    const isMobile = /Android|Mobile|iPod|Windows Phone/i.test(
      navigator.userAgent
    );

    setIsMobile(!isMobile);
    const myYears = await getYears();
    preload(myYears[0]);
    setYearOptions(myYears);
    setSelectedYearKeys(myYears[0]);
    setYearTerm(myYears[0]);
    startTransition(() => {
      getItem(myYears[0], number)
        .then((response: any) => {
          setData(response);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    /*
    await axios
      .get("/api/getCourseStats?year=" + selectedYearKeys)
      .then(function (response) {
        // Handle response
        setData(response.data);
        setIsLoading(false);
      })
      .catch(function (error) {
        console.log(error);
      });
      */
  }, []);

  useEffect(() => {
    firstRun();
  }, []);

  return (
    <>
      <div className=" lg:h-[80vh] ">
        <div className="w-full grid lg:grid-cols-2 grid-cols-1">
          <Select
            selectionMode="single"
            isRequired
            disallowEmptySelection
            selectedKeys={[selectedYearKeys]}
            className="max-w-sm mt-5 sm:mt-0 lg:px-0 px-5"
            label="Semester"
            onChange={handleYearChange}
          >
            {yearOptions.map((year) => (
              <SelectItem key={year}>
                {year.replace("F", "Fall ").replace("S", "Spring ")}
              </SelectItem>
            ))}
          </Select>
          <ButtonGroup className="lg:ml-auto mt-5 lg:mt-0 mb-5 lg:mb-0">
            <Button
              onPress={() => {
                setNumber(5);
                getNewData(5);
              }}
            >
              5
            </Button>
            <Button
              onPress={() => {
                setNumber(10);
                getNewData(10);
              }}
            >
              10
            </Button>
            <Button
              onPress={() => {
                setNumber(20);
                getNewData(20);
              }}
            >
              20
            </Button>
          </ButtonGroup>
        </div>

        {!isLoading && data ? (
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:p-10 lg:h-[70vh] justify-items-center px-5  col-span-4">
              <Bar
                //@ts-ignore //TODO Figure out why ts hates the following line
                options={options}
                data={{
                  labels: data
                    .slice(0, number)
                    .map((row: any) => row.courseTitle),
                  datasets: [
                    {
                      data: data
                        .slice(0, number)
                        .map((row: any) => row._count.CoursePlan),
                      backgroundColor: "rgba(255, 99, 132, 0.5)",
                    },
                  ],
                }}
              />
            </div>
            <div className="p-5 lg:p-0 h-[45vh] lg:h-[70vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent ">
              {data.map((thing: any) => (
                <Card
                  className="mt-2 bg-light_foreground shadow-md"
                  key={thing.id}
                >
                  <CardBody className="overflow-y-clip">
                    {thing.courseTitle}
                  </CardBody>
                  <CardFooter>{thing._count.CoursePlan}</CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className=" w-[95vw] grid justify-items-center justify-self-center">
            <CircularProgress
              label="Fetching Stats"
              aria-label="Loading..."
              size="lg"
            />
          </div>
        )}
      </div>
    </>
  );
}
