"use client";

import { Icon } from "@iconify/react";
import { addToast, Card, Chip, cn, Spacer, Tab, Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import GetFlowStats from "@/lib/fetch/flow/stats";

type ChartData = {
  key: string;
  alerts: number;
  executions: number;
};

type Chart = {
  key: string;
  title: string;
  value: number;
  type: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  chartData: ChartData[];
};

const formatValue = (value: number, type: string | undefined) => {
  if (type === "number") {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }

    return value.toLocaleString();
  }
  if (type === "percentage") {
    return `${value}%`;
  }

  return value;
};

export default function FlowStats({ flowID }: { flowID: string }) {
  const [interval, setInterval] = useState("24-hours");
  const [stats, setStats] = useState<any>({});

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const handleTabChange = (key: any) => {
    setInterval(key);
    params.set("interval", key);
    router.push(`${pathname}?${params.toString()}`);
  };

  async function getStats() {
    const stats = await GetFlowStats(flowID, interval);

    if (stats.success) {
      setStats(stats.data);
    } else {
      if ("message" in stats) {
        addToast({
          title: "Stats",
          description: stats.message,
          color: "danger",
          variant: "flat",
        });
      }
    }
  }

  useEffect(() => {
    getStats();
  }, [interval]);

  const data: Chart[] = [
    {
      key: "alerts-executions",
      title: "Alerts / Executions",
      value: stats?.alerts_executions_trends?.total_alerts || 0,
      type: "number",
      change: stats?.alerts_executions_trends?.alert_trend.percentage || 0,
      changeType:
        stats?.alerts_executions_trends?.alert_trend?.direction || "positive",
      chartData: stats.alerts_executions_stats || [],
    },
    // {
    //   key: "executions",
    //   title: "Executions",
    //   value: 623000,
    //   type: "number",
    //   change: "-2.1%",
    //   changeType: "neutral",
    //   chartData: [
    //     { month: "Jan", value: 587000, lastYearValue: 243500 },
    //     { month: "Feb", value: 698000, lastYearValue: 318500 },
    //     { month: "Mar", value: 542000, lastYearValue: 258300 },
    //     { month: "Apr", value: 728000, lastYearValue: 335300 },
    //     { month: "May", value: 615000, lastYearValue: 289600 },
    //     { month: "Jun", value: 689000, lastYearValue: 256400 },
    //     { month: "Jul", value: 573000, lastYearValue: 245200 },
    //     { month: "Aug", value: 695000, lastYearValue: 384600 },
    //     { month: "Sep", value: 589000, lastYearValue: 273500 },
    //     { month: "Oct", value: 652000, lastYearValue: 365900 },
    //     { month: "Nov", value: 623000, lastYearValue: 282300 },
    //     { month: "Dec", value: 523000, lastYearValue: 295000 },
    //   ],
    // },
  ];

  const [activeChart, setActiveChart] = React.useState<
    (typeof data)[number]["key"]
  >(data[0].key);

  const activeChartData = React.useMemo(() => {
    const chart = data.find((d) => d.key === activeChart);

    return {
      chartData: chart?.chartData ?? [],
      color:
        chart?.changeType === "positive"
          ? "success"
          : chart?.changeType === "negative"
            ? "danger"
            : "default",
      type: chart?.type,
    };
  }, [activeChart, stats]);

  const { chartData, color, type } = activeChartData;

  return (
    <Card as="dl" className="border border-transparent dark:border-default-100">
      <section className="flex flex-col flex-nowrap">
        <div className="flex flex-col justify-between gap-y-2 p-6">
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-col gap-y-0">
              <dt className="text-medium font-medium text-foreground">
                Analytics
              </dt>
            </div>
            <Spacer y={2} />
            <Tabs
              selectedKey={interval}
              size="sm"
              onSelectionChange={handleTabChange}
            >
              <Tab key="24-hours" title="24 Hours" />
              <Tab key="7-days" title="7 Days" />
              <Tab key="30-days" title="30 Days" />
              <Tab key="3-months" title="3 Months" />
              <Tab key="6-months" title="6 Months" />
            </Tabs>
            <div className="mt-2 flex w-full items-center">
              <div className="-my-3 flex w-full max-w-[800px] items-center gap-x-3 overflow-x-auto py-3">
                {data.map(({ key, change, changeType, type, value, title }) => (
                  <button
                    key={key}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-medium p-3 transition-colors",
                      {
                        "bg-default-100": activeChart === key,
                      },
                    )}
                    onClick={() => setActiveChart(key)}
                  >
                    <span
                      className={cn(
                        "text-small font-medium text-default-500 transition-colors",
                        {
                          "text-primary": activeChart === key,
                        },
                      )}
                    >
                      {title}
                    </span>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-x-3">
                        <span className="text-3xl font-bold text-foreground">
                          {formatValue(value, type)}
                        </span>
                        <Chip
                          classNames={{
                            content: "font-medium",
                          }}
                          color={
                            changeType === "positive"
                              ? "success"
                              : changeType === "negative"
                                ? "danger"
                                : "default"
                          }
                          radius="sm"
                          size="sm"
                          startContent={
                            changeType === "positive" ? (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-up-linear"
                                width={16}
                              />
                            ) : changeType === "negative" ? (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-down-linear"
                                width={16}
                              />
                            ) : (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-linear"
                                width={16}
                              />
                            )
                          }
                          variant="flat"
                        >
                          <span>{change}%</span>
                        </Chip>
                      </div>
                      {/* Executions */}
                      <div className="flex items-center gap-x-3">
                        <span className="text-3xl font-bold text-foreground">
                          {stats?.alerts_executions_trends?.total_executions ||
                            0}
                        </span>
                        <Chip
                          classNames={{
                            content: "font-medium",
                          }}
                          color={
                            stats?.alerts_executions_trends?.execution_trend
                              ?.direction === "positive"
                              ? "success"
                              : changeType === "negative"
                                ? "danger"
                                : "default"
                          }
                          radius="sm"
                          size="sm"
                          startContent={
                            stats?.alerts_executions_trends?.execution_trend
                              ?.direction === "positive" ? (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-up-linear"
                                width={16}
                              />
                            ) : stats?.alerts_executions_trends?.execution_trend
                                ?.direction === "negative" ? (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-down-linear"
                                width={16}
                              />
                            ) : (
                              <Icon
                                height={16}
                                icon="solar:arrow-right-linear"
                                width={16}
                              />
                            )
                          }
                          variant="flat"
                        >
                          <span>
                            {
                              stats?.alerts_executions_trends?.execution_trend
                                ?.percentage
                            }
                            %
                          </span>
                        </Chip>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ResponsiveContainer
          className="min-h-[300px] [&_.recharts-surface]:outline-none"
          height="100%"
          width="100%"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            height={300}
            margin={{
              left: 0,
              right: 0,
            }}
            width={500}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="10%"
                  stopColor={`hsl(var(--heroui-${color}-500))`}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={`hsl(var(--heroui-${color}-100))`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontalCoordinatesGenerator={() => [200, 150, 100, 50]}
              stroke="hsl(var(--heroui-default-200))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="key"
              style={{
                fontSize: "var(--heroui-font-size-tiny)",
                transform: "translateX(-40px)",
              }}
              tickLine={false}
            />
            <Tooltip
              content={({ label, payload }) => (
                <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                  <div className="flex w-full flex-col gap-y-0">
                    {payload?.map((p, index) => {
                      const name = p.name;
                      const value = p.value;

                      return (
                        <div
                          key={`${index}-${name}`}
                          className="flex w-full items-center gap-x-2"
                        >
                          <div className="flex w-full items-center gap-x-1 text-small text-background">
                            <span>{formatValue(value as number, type)}</span>
                            <span className="capitalize">{name}</span>
                          </div>
                        </div>
                      );
                    })}
                    <span className="text-small font-medium text-foreground-400">
                      {label}
                    </span>
                  </div>
                </div>
              )}
              cursor={{
                strokeWidth: 0,
              }}
            />
            <Area
              activeDot={{
                stroke: `hsl(var(--heroui-${color === "default" ? "foreground" : color}))`,
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="alerts"
              fill="url(#colorGradient)"
              stroke={`hsl(var(--heroui-${color === "default" ? "foreground" : color}))`}
              strokeWidth={2}
              type="monotone"
            />
            <Area
              activeDot={{
                stroke: "hsl(var(--heroui-default-400))",
                strokeWidth: 2,
                fill: "hsl(var(--heroui-background))",
                r: 5,
              }}
              animationDuration={1000}
              animationEasing="ease"
              dataKey="executions"
              fill="transparent"
              stroke="hsl(var(--heroui-primary-400))"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </Card>
  );
}
