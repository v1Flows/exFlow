"use client";
import { Card, type CardProps, cn } from "@heroui/react";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
type ChartData = {
  weekday: string;
  [key: string]: string | number;
};
type BarChartProps = {
  title: string;
  categories: {
    title: string;
    color: string;
  }[];
  chartData: ChartData[];
};
export default function DashboardExecutionsStats({ stats }: { stats: any }) {
  const data: BarChartProps[] = [
    {
      title: "Processed Executions",
      categories: [
        {
          title: "Success",
          color: "success",
        },
        {
          title: "Error",
          color: "danger",
        },
        {
          title: "Pending",
          color: "default",
        },
        {
          title: "Running",
          color: "primary",
        },
        {
          title: "Canceled",
          color: "danger-300",
        },
        {
          title: "Scheduled",
          color: "secondary",
        },
        {
          title: "NoPatternMatch",
          color: "secondary-300",
        },
        {
          title: "Recovered",
          color: "warning",
        },
      ],
      chartData: stats.executions,
    },
    {
      title: "Incoming Alerts",
      categories: [
        {
          title: "Resolved",
          color: "success",
        },
        {
          title: "Firing",
          color: "danger",
        },
      ],
      chartData: stats.alerts,
    },
  ];
  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2">
      {data.map((item, index) => (
        <BarChartCard key={index} {...item} />
      ))}
    </dl>
  );
}
const formatWeekday = (weekday: string) => {
  const day =
    {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 0,
    }[weekday] ?? 0;
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(2024, 0, day),
  );
};
const BarChartCard = React.forwardRef<
  // eslint-disable-next-line no-undef
  HTMLDivElement,
  Omit<CardProps, "children"> & BarChartProps
>(({ className, title, categories, chartData, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        "bg-surface/60 backdrop-blur-md shadow-lg border border-default h-[300px]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-y-4 p-4">
        <dt>
          <h3 className="text-sm text-muted font-medium">{title}</h3>
        </dt>
        <dd className="text-xs text-muted flex flex-wrap w-full justify-end gap-4">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--heroui-${category.color}))`,
                }}
              />
              <span className="capitalize">{category.title}</span>
            </div>
          ))}
        </dd>
      </div>
      <ResponsiveContainer
        className="[&_.recharts-surface]:outline-hidden"
        height="100%"
        width="100%"
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 20,
            right: 14,
            left: -8,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="weekday"
            strokeOpacity={0.25}
            style={{ fontSize: "var(--heroui-font-size-tiny)", color: "red" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            style={{ fontSize: "var(--heroui-font-size-tiny)" }}
            tickLine={false}
          />
          <Tooltip
            content={({ label, payload }) => (
              <div className="rounded-md bg-background text-xs shadow-sm flex h-auto min-w-[120px] items-center gap-x-2 p-2">
                <div className="flex w-full flex-col gap-y-1">
                  <span className="text-foreground font-medium">
                    {formatWeekday(label)}
                  </span>
                  {payload?.map((p, index) => {
                    const name = p.name;
                    const value = p.value;
                    const category = categories.find(
                      (c) => c.title.toLowerCase() === name,
                    ) ?? { title: name, color: "default" };
                    return (
                      <div
                        key={`${index}-${name}`}
                        className="flex w-full items-center gap-x-2"
                      >
                        <div
                          className="h-2 w-2 flex-none rounded-full"
                          style={{
                            backgroundColor: `hsl(var(--heroui-${category.color}))`,
                          }}
                        />
                        <div className="text-foreground flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                          <span className="text-muted">{category.title}</span>
                          <span className="text-foreground font-mono font-medium">
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            cursor={false}
          />
          {categories.map((category, index) => (
            <Bar
              key={`${category}-${index}`}
              animationDuration={450}
              animationEasing="ease"
              barSize={24}
              dataKey={category.title.toLowerCase()}
              fill={`hsl(var(--heroui-${category.color}))`}
              radius={index === categories.length - 1 ? [4, 4, 0, 0] : 0}
              stackId="bars"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
});
BarChartCard.displayName = "BarChartCard";
