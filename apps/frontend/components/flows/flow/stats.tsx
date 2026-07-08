"use client";
import { Icon } from "@iconify/react";
import { Card, Chip, cn, Tabs, toast } from "@heroui/react";
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

const chartColors: Record<string, string> = {
  accent: "var(--accent)",
  danger: "var(--danger)",
  default: "var(--muted)",
  success: "var(--success)",
  warning: "var(--warning)",
};

const getChartColor = (color: string) =>
  chartColors[color] ?? chartColors.default;

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
        toast.danger("Stats", { description: stats.message });
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
            : "accent",
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
        <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Header className="flex flex-col gap-4 px-6 pt-6 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Icon icon="hugeicons:analytics-01" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">Analytics</p>
                  <p className="text-sm text-muted">
                    Performance metrics over time.
                  </p>
                </div>
              </div>
              <Tabs
                selectedKey={interval}
                variant={"primary"}
                onSelectionChange={handleTabChange}
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label={"Options"}>
                    <Tabs.Tab id={"24-hours"}>
                      {"24 Hours"}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id={"7-days"}>
                      {"7 Days"}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id={"30-days"}>
                      {"30 Days"}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id={"3-months"}>
                      {"3 Months"}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id={"6-months"}>
                      {"6 Months"}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
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
                      "bg-surface-secondary/50 border-default shadow-sm":
                        activeChart === key,
                      "hover:bg-surface-secondary/30": activeChart !== key,
                    },
                  )}
                  onClick={() => setActiveChart(key)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium text-muted transition-colors",
                      {
                        "text-accent": activeChart === key,
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
                      color={
                        changeType === "positive"
                          ? "success"
                          : changeType === "negative"
                            ? "danger"
                            : "default"
                      }
                      size="sm"
                      variant="soft"
                    >
                      {changeType === "positive" ? (
                        <Icon icon="solar:arrow-right-up-linear" width={12} />
                      ) : changeType === "negative" ? (
                        <Icon icon="solar:arrow-right-down-linear" width={12} />
                      ) : (
                        <Icon icon="solar:arrow-right-linear" width={12} />
                      )}
                      <Chip.Label>{change}%</Chip.Label>
                    </Chip>
                  </div>
                </button>
              ))}
            </div>
          </Card.Header>

          <Card.Content className="px-2 pb-4 h-[350px]">
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
                      stopColor={getChartColor(color)}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={getChartColor(color)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--separator)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <YAxis hide />
                <XAxis
                  axisLine={false}
                  dataKey="key"
                  dy={10}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 12,
                  }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface/80 backdrop-blur-md border border-default p-3 rounded-lg shadow-lg">
                          <p className="text-xs text-muted mb-1">{label}</p>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: getChartColor(color) }}
                            />
                            <span className="font-bold text-sm">
                              {formatValue(payload[0].value as number, type)}
                            </span>
                            <span className="text-xs text-muted capitalize">
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
                    stroke: "var(--background)",
                    strokeWidth: 2,
                    fill: getChartColor(color),
                    r: 5,
                  }}
                  animationDuration={1500}
                  dataKey="executions"
                  fill="url(#colorGradient)"
                  stroke={getChartColor(color)}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}
