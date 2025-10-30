"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Rating } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RatingOverTimeGraphProps {
  ratings: Rating[];
}

type TimeFrame = "all" | "1year" | "6months" | "3months";

interface ChartDataPoint {
  date: string;
  overallRating: number;
  difficulty: number;
  count: number;
}

export default function RatingOverTimeGraph({
  ratings,
}: RatingOverTimeGraphProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    processRatings();
  }, [ratings, timeFrame]);

  const filterRatingsByTimeFrame = (ratings: Rating[]): Rating[] => {
    if (timeFrame === "all") {
      return ratings;
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFrame) {
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
    }

    return ratings.filter((rating) => {
      const ratingDate = rating.rmpDate || rating.createdAt;
      return new Date(ratingDate) >= cutoffDate;
    });
  };

  const processRatings = () => {
    const filteredRatings = filterRatingsByTimeFrame(ratings);

    // Group ratings by month
    const groupedByMonth: { [key: string]: Rating[] } = {};

    filteredRatings.forEach((rating) => {
      const date = rating.rmpDate || rating.createdAt;
      if (!date) return;

      const dateObj = new Date(date);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(rating);
    });

    // Calculate averages for each month
    const data: ChartDataPoint[] = Object.keys(groupedByMonth)
      .sort()
      .map((monthKey) => {
        const monthRatings = groupedByMonth[monthKey];
        const validOverallRatings = monthRatings.filter(
          (r) => r.overallRating !== null
        );
        const validDifficultyRatings = monthRatings.filter(
          (r) => r.difficulty !== null
        );

        const avgOverall =
          validOverallRatings.length > 0
            ? validOverallRatings.reduce(
                (sum, r) => sum + (r.overallRating || 0),
                0
              ) / validOverallRatings.length
            : 0;

        const avgDifficulty =
          validDifficultyRatings.length > 0
            ? validDifficultyRatings.reduce(
                (sum, r) => sum + (r.difficulty || 0),
                0
              ) / validDifficultyRatings.length
            : 0;

        // Format date for display
        const [year, month] = monthKey.split("-");
        const dateLabel = new Date(parseInt(year), parseInt(month) - 1)
          .toLocaleDateString("en-US", { month: "short", year: "numeric" });

        return {
          date: dateLabel,
          overallRating: parseFloat(avgOverall.toFixed(2)),
          difficulty: parseFloat(avgDifficulty.toFixed(2)),
          count: monthRatings.length,
        };
      });

    setChartData(data);
  };

  const handleTimeFrameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFrame(e.target.value as TimeFrame);
  };

  if (ratings.length === 0) {
    return (
      <Card className="w-full">
        <CardBody>
          <p className="text-center text-gray-500">
            No ratings available to display
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xl font-bold">Rating Over Time</h3>
        <Select
          label="Time Frame"
          className="max-w-xs"
          selectedKeys={[timeFrame]}
          onChange={handleTimeFrameChange}
          size="sm"
        >
          <SelectItem key="all" value="all">
            All Time
          </SelectItem>
          <SelectItem key="1year" value="1year">
            Past Year
          </SelectItem>
          <SelectItem key="6months" value="6months">
            Past 6 Months
          </SelectItem>
          <SelectItem key="3months" value="3months">
            Past 3 Months
          </SelectItem>
        </Select>
      </CardHeader>
      <CardBody>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-500">
            No ratings available for the selected time frame
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                style={{ fontSize: "12px" }}
              />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-700 rounded shadow-lg">
                        <p className="font-semibold mb-2">
                          {payload[0].payload.date}
                        </p>
                        <p className="text-sm" style={{ color: "#8b5cf6" }}>
                          Overall: {payload[0].payload.overallRating}/5
                        </p>
                        <p className="text-sm" style={{ color: "#f59e0b" }}>
                          Difficulty: {payload[0].payload.difficulty}/5
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {payload[0].payload.count} rating
                          {payload[0].payload.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="overallRating"
                stroke="#8b5cf6"
                name="Overall Rating"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="difficulty"
                stroke="#f59e0b"
                name="Difficulty"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

