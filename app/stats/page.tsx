"use client";
import { useCallback, useEffect, useState, startTransition } from "react";
import { Bar } from "react-chartjs-2";
import { Button, ButtonGroup } from "@nextui-org/button";
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
  CircularProgress,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { getYears } from "@/actions/getProfs";
import { preload, getItem } from "@/actions/getStats";
import CourseDetailsModal from "@/components/CourseDetailsModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function StatsPage(props: any) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [number, setNumber] = useState<number>(5);
  const [term, setTerm] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [yearterm, setYearTerm] = useState<string>("");
  const [mobile, setIsMobile] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>();

  const [yearOptions, setYearOptions] = useState<Array<string>>([]);
  const [selectedYearKeys, setSelectedYearKeys] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    onClick: (_event: unknown, elements: any[]) => {
      if (elements.length > 0 && data?.[elements[0].index]) {
        openCourse(data[elements[0].index]);
      }
    },
    onHover: (event: any, elements: any[]) => {
      if (event.native?.target) {
        event.native.target.style.cursor = elements.length ? "pointer" : "default";
      }
    },

    scales: {
      x: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.16)",
        },
        ticks: {
          color: "#94a3b8",
          precision: 0,
          font: {
            size: 11,
            weight: 600 as const,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          display: mobile,
          color: "#64748b",
          font: {
            size: 11,
            weight: 600 as const,
          },
          padding: 8,
        },
      },
    },

    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        displayColors: false,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) =>
            `${context.parsed.x} ${context.parsed.x === 1 ? "plan" : "plans"}`,
        },
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

  function openCourse(course: any) {
    setSelectedCourse(course);
    onOpen();
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
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-6 pt-2 lg:h-[80vh] lg:min-h-0 lg:px-0 lg:pb-0">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Planner insights
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Most planned courses
          </h1>
          <p className="mt-1 text-sm text-default-500">
            See which courses students are adding to their schedules most
            often.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select
            selectionMode="single"
            isRequired
            disallowEmptySelection
            selectedKeys={[selectedYearKeys]}
            className="w-full sm:w-56"
            classNames={{
              trigger:
                "border border-default-200 bg-content1 shadow-sm hover:bg-default-100",
            }}
            label="Semester"
            onChange={handleYearChange}
          >
            {yearOptions.map((year) => (
              <SelectItem key={year}>
                {year.replace("F", "Fall ").replace("S", "Spring ")}
              </SelectItem>
            ))}
          </Select>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-default-500">
              Courses shown
            </div>
            <ButtonGroup
              className="rounded-xl border border-default-200 bg-content1 p-1 shadow-sm"
              size="sm"
            >
              {[5, 10, 20].map((count) => (
                <Button
                  key={count}
                  className="min-w-12 font-semibold"
                  color={number === count ? "primary" : "default"}
                  variant={number === count ? "solid" : "light"}
                  onPress={() => {
                    setNumber(count);
                    getNewData(count);
                  }}
                >
                  {count}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      </header>

      {!isLoading && data ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <Card className="min-h-[420px] border border-default-200 bg-content1/80 shadow-sm lg:min-h-0">
            <CardBody className="flex min-h-0 flex-col gap-1 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Course popularity
                  </h2>
                  <p className="text-xs text-default-500">
                    {selectedYearKeys
                      ? selectedYearKeys
                          .replace("F", "Fall ")
                          .replace("S", "Spring ")
                      : "Current semester"}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Top {number}
                </span>
              </div>

              <div className="mt-3 min-h-[340px] flex-1">
                <Bar
                  options={options}
                  data={{
                    labels: data
                      .slice(0, number)
                      .map((row: any) => row.courseTitle),
                    datasets: [
                      {
                        label: "Plans",
                        data: data
                          .slice(0, number)
                          .map((row: any) => row._count.CoursePlan),
                        backgroundColor: "rgba(244, 101, 35, 0.82)",
                        hoverBackgroundColor: "rgba(244, 101, 35, 1)",
                        borderRadius: 7,
                        borderSkipped: false,
                        maxBarThickness: 26,
                      },
                    ],
                  }}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="border border-default-200 bg-content1/80 shadow-sm lg:min-h-0">
            <CardBody className="flex min-h-0 flex-col p-0">
              <div className="border-b border-default-200 px-5 py-4">
                <h2 className="text-base font-bold text-foreground">Rankings</h2>
                <p className="text-xs text-default-500">
                  Plans created by students
                </p>
              </div>

              <div className="min-h-0 flex-1 divide-y divide-default-100 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-accent-500 scrollbar-track-transparent">
                {data.slice(0, number).map((thing: any, index: number) => (
                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-default-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    key={thing.id}
                    onClick={() => openCourse(thing)}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-default-100 text-xs font-bold text-default-500 group-hover:bg-primary/10 group-hover:text-primary">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                      {thing.courseTitle}
                    </span>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {thing._count.CoursePlan}
                    </span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card className="grid min-h-[420px] flex-1 place-items-center border border-default-200 bg-content1/80 shadow-sm">
          <CircularProgress
            label="Fetching statistics"
            aria-label="Loading statistics"
            color="primary"
            size="lg"
          />
        </Card>
      )}

      <CourseDetailsModal
        course={selectedCourse}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}
