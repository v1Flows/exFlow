"use client";

import { Icon } from "@iconify/react";
import {
  addToast,
  Card,
  CardBody,
  CardHeader,
  Chip,
  cn,
  Tab,
  Tabs,
} from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import GetFlowStats from "@/lib/fetch/flow/stats";

type ChartData = {
  key: string;
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
      key: "executions",
      title: "Executions",
      value: stats?.executions_trends?.total_executions || 0,
      type: "number",
      change: stats?.executions_trends?.execution_trend.percentage || 0,
      changeType:
        stats?.executions_trends?.execution_trend?.direction || "positive",
      chartData: stats.executions_stats || [],
    },
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
            : "primary",
      type: chart?.type,
    };
  }, [activeChart, stats]);

  const { chartData, color, type } = activeChartData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div animate="visible" initial="hidden" variants={containerVariants}>
      <motion.div variants={itemVariants}>
        <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
          <CardHeader className="flex flex-col gap-4 px-6 pt-6 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon icon="hugeicons:analytics-01" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">Analytics</p>
                  <p className="text-small text-default-500">
                    Performance metrics over time.
                  </p>
                </div>
              </div>
              <Tabs
                classNames={{
                  tabList: "bg-content2/50 border-default-200",
                }}
                selectedKey={interval}
                size="sm"
                variant="bordered"
                onSelectionChange={handleTabChange}
              >
                <Tab key="24-hours" title="24 Hours" />
                <Tab key="7-days" title="7 Days" />
                <Tab key="30-days" title="30 Days" />
                <Tab key="3-months" title="3 Months" />
                <Tab key="6-months" title="6 Months" />
              </Tabs>
            </div>

            {/* Stat Selectors */}
            <div className="flex w-full items-center gap-4 overflow-x-auto pb-2">
              {data.map(({ key, change, changeType, type, value, title }) => (
                <button
                  key={key}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl p-3 transition-all border border-transparent min-w-[200px] text-left",
                    {
                      "bg-content2/50 border-default-200 shadow-sm":
                        activeChart === key,
                      "hover:bg-content2/30": activeChart !== key,
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-foreground">
                      {formatValue(value, type)}
                    </span>
                    <Chip
                      classNames={{
                        content: "font-medium text-tiny",
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
                          <Icon icon="solar:arrow-right-up-linear" width={12} />
                        ) : changeType === "negative" ? (
                          <Icon
                            icon="solar:arrow-right-down-linear"
                            width={12}
                          />
                        ) : (
                          <Icon icon="solar:arrow-right-linear" width={12} />
                        )
                      }
                      variant="flat"
                    >
                      {change}%
                    </Chip>
                  </div>
                </button>
              ))}
            </div>
          </CardHeader>

          <CardBody className="px-2 pb-4 h-[350px]">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={`hsl(var(--heroui-${color}-500))`}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={`hsl(var(--heroui-${color}-500))`}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="hsl(var(--heroui-default-200))"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <YAxis hide />
                <XAxis
                  axisLine={false}
                  dataKey="key"
                  dy={10}
                  tick={{
                    fill: "hsl(var(--heroui-default-500))",
                    fontSize: 12,
                  }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-content1/80 backdrop-blur-md border border-default-200 p-3 rounded-lg shadow-lg">
                          <p className="text-tiny text-default-500 mb-1">
                            {label}
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full bg-${color}-500`}
                            />
                            <span className="font-bold text-small">
                              {formatValue(payload[0].value as number, type)}
                            </span>
                            <span className="text-tiny text-default-400 capitalize">
                              {payload[0].name}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }}
                />
                <Area
                  activeDot={{
                    stroke: "hsl(var(--heroui-background))",
                    strokeWidth: 2,
                    fill: `hsl(var(--heroui-${color}-500))`,
                    r: 5,
                  }}
                  animationDuration={1500}
                  dataKey="executions"
                  fill="url(#colorGradient)"
                  stroke={`hsl(var(--heroui-${color}-500))`}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
