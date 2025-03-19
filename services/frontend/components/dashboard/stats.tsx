"use client";

import { Icon } from "@iconify/react";
import { Card, Chip } from "@heroui/react";
import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { cn } from "@/components/cn/cn";

const formatWeekday = (weekday: string) => {
  if (weekday === "Mo") {
    return "Monday";
  } else if (weekday === "Tu") {
    return "Tuesday";
  } else if (weekday === "We") {
    return "Wednesday";
  } else if (weekday === "Th") {
    return "Thursday";
  } else if (weekday === "Fr") {
    return "Friday";
  } else if (weekday === "Sa") {
    return "Saturday";
  } else if (weekday === "Su") {
    return "Sunday";
  }
};

const formatValue = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Stats({ stats }: { stats: any }) {
  const data = [
    {
      title: "Total Executions this week",
      value: stats.total_executions,
      change: `${stats.execution_trend_percentage}% today`,
      changeType: stats.execution_trend,
      trendChipPosition: "bottom",
      chartData: stats.executions,
    },
  ];

  const handleMouseEnter = React.useCallback(
    (chartIndex: number, itemIndex: number) => {
      // eslint-disable-next-line no-undef
      const bars = document.querySelectorAll(
        `#chart-${chartIndex} .recharts-bar-rectangle`,
      );

      bars.forEach((bar, i) => {
        if (i !== itemIndex) {
          const path = bar.querySelector("path");

          if (path) {
            path.setAttribute("fill", "hsl(var(--heroui-default-300))");
          }
        }
      });
    },
    [],
  );

  const handleMouseLeave = React.useCallback((chartIndex: number) => {
    // eslint-disable-next-line no-undef
    const bars = document.querySelectorAll(
      `#chart-${chartIndex} .recharts-bar-rectangle`,
    );

    bars.forEach((bar) => {
      const path = bar.querySelector("path");

      if (path) {
        path.setAttribute("fill", "hsl(var(--heroui-foreground))");
      }
    });
  }, []);

  const trendChipContent = React.useCallback(
    ({
      changeType,
      change,
      trendChipPosition,
    }: {
      changeType: string;
      change: string;
      trendChipPosition: string;
    }) => (
      <div
        className={cn({
          "self-start": trendChipPosition === "top",
          "self-end": trendChipPosition === "bottom",
        })}
      >
        <Chip
          classNames={{
            content: "font-medium",
          }}
          color={
            changeType === "positive"
              ? "success"
              : changeType === "neutral"
                ? "warning"
                : changeType === "negative"
                  ? "danger"
                  : "default"
          }
          radius="sm"
          size="sm"
          startContent={
            changeType === "positive" ? (
              <Icon height={16} icon="solar:arrow-right-up-linear" width={16} />
            ) : changeType === "neutral" ? (
              <Icon height={16} icon="solar:arrow-right-linear" width={16} />
            ) : (
              <Icon
                height={16}
                icon="solar:arrow-right-down-linear"
                width={16}
              />
            )
          }
          variant="flat"
        >
          <span>{change}</span>
        </Chip>
      </div>
    ),
    [],
  );

  return (
    <dl>
      {data.map(
        ({ title, value, changeType, change, trendChipPosition }, index) => (
          <Card
            key={index}
            className="min-h-[120px] border border-transparent px-4 dark:border-default-100"
          >
            <section className="flex h-full flex-nowrap items-center justify-between">
              <div className="flex h-full flex-col gap-y-3 py-4 md:flex-row md:justify-between md:gap-x-2">
                <div className="flex size-full flex-col justify-between gap-y-3">
                  <dt className="flex items-center gap-x-2 text-base font-medium text-default-500">
                    {title}
                  </dt>
                  <div className="flex gap-x-2">
                    <dd className="text-3xl font-semibold text-default-700">
                      {value}
                      <div className="md:hidden">
                        {trendChipContent({
                          changeType,
                          change,
                          trendChipPosition,
                        })}
                      </div>
                    </dd>
                    <div
                      className={cn("hidden md:block", {
                        "self-start": trendChipPosition === "top",
                        "self-end": trendChipPosition === "bottom",
                      })}
                    >
                      {trendChipContent({
                        changeType,
                        change,
                        trendChipPosition,
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex h-[120px] w-[180px] shrink-0 items-center">
                <ResponsiveContainer
                  className="[&_.recharts-surface]:outline-none"
                  height="100%"
                  width="100%"
                >
                  <BarChart
                    accessibilityLayer
                    barSize={12}
                    data={data[index].chartData}
                    id={`chart-${index}`}
                    margin={{ top: 24, bottom: 4 }}
                  >
                    <XAxis
                      axisLine={false}
                      dataKey="weekday"
                      style={{ fontSize: "var(--heroui-font-size-tiny)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ label, payload }) => (
                        <div className="flex h-8 min-w-[80px] items-center gap-x-2 rounded-medium bg-background p-2 text-tiny shadow-small">
                          <div className="size-2 rounded-sm bg-foreground" />
                          <span className="text-default-500">
                            {formatWeekday(label)}
                          </span>
                          <span className="font-medium text-default-700">
                            {formatValue(payload?.[0]?.value as number)}
                          </span>
                        </div>
                      )}
                      cursor={false}
                    />
                    <Bar
                      background={{
                        fill: "hsl(var(--heroui-default-200))",
                        radius: 8,
                      }}
                      className="transition-colors"
                      dataKey="value"
                      fill="hsl(var(--heroui-foreground))"
                      radius={8}
                      onMouseEnter={(_, itemIndex) =>
                        handleMouseEnter(index, itemIndex)
                      }
                      onMouseLeave={() => handleMouseLeave(index)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </Card>
        ),
      )}
    </dl>
  );
}
