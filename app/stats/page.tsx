"use client";

import { useCallback, useEffect, useState } from "react";
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
import useSWR from "swr";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);
const fetcher = (url: any) => fetch(url).then((r) => r.json());

export default function StatsPage(props: any) {
  const router = useRouter();

  const [number, setNumber] = useState<number>(5);
  const [term, setTerm] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [yearterm, setYearTerm] = useState<string>("");
  const [mobile, setIsMobile] = useState<Boolean>(true);

  const [yearOptions, setYearOptions] = useState<Array<string>>([]);
  const [selectedYearKeys, setSelectedYearKeys] = useState<string>("");

  const { data, error, isLoading } = useSWR(
    "/api/getCourseStats?year=" + selectedYearKeys,
    fetcher
  );

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
    //getData(e.target.value);
  };

  const firstRun = useCallback(async () => {
    const isMobile = /Android|Mobile|iPod|Windows Phone/i.test(
      navigator.userAgent
    );

    setIsMobile(!isMobile);
    const myYears = await getYears();
    setYearOptions(myYears);
    setSelectedYearKeys(myYears[0]);
    setYearTerm(myYears[0]);
    //const theData = await axios.get("/api/getCourseStats?year=" + myYears[0]);
    //const theData = await getCourseStats(myYears[0]);
    //setData(theData);
  }, []);

  useEffect(() => {
    firstRun();
  }, []);

  return (
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
            }}
          >
            5
          </Button>
          <Button
            onPress={() => {
              setNumber(10);
            }}
          >
            10
          </Button>
          <Button
            onPress={() => {
              setNumber(20);
            }}
          >
            20
          </Button>
        </ButtonGroup>
      </div>

      {!isLoading && data && !error ? (
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:p-10 lg:h-[70vh] justify-items-center px-5  col-span-4">
            <Bar
              //@ts-ignore //TODO Figure out why ts hates the following line
              options={options}
              data={{
                labels: data.slice(0, number).map((row: any) => row.label),
                datasets: [
                  {
                    data: data.slice(0, number).map((row: any) => row.data),
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
                <CardBody className="overflow-y-clip">{thing.label}</CardBody>
                <CardFooter>{thing.data}</CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className=" w-[95vw] grid justify-items-center ">
          <CircularProgress aria-label="Loading..." size="lg" />
        </div>
      )}
    </div>
  );
}
