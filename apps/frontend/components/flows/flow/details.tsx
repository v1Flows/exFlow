"use client";
import { Alert, Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import NumberFlow from "@number-flow/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useFlowExecutions } from "@/lib/swr/hooks/flows";

export default function FlowDetails({
  flow,
  project,
  runners,
}: {
  flow: any;
  project: any;
  runners: any;
}) {
  const router = useRouter();
  const { total: totalExecutions } = useFlowExecutions(flow.id);

  const stats = [
    {
      title: "Status",
      value: flow.disabled ? "Disabled" : "Active",
      icon: "hugeicons:stethoscope-02",
      color: flow.disabled ? "danger" : "success",
      isText: true,
    },
    {
      title: "Project",
      value: project.name,
      icon: "hugeicons:ai-folder-01",
      color: "primary",
      isText: true,
      isLink: true,
      link: `/projects/${project.id}`,
    },
    {
      title: "Runner",
      value:
        runners.find((r: any) => r.id === flow.runner_id)?.name ||
        flow.runner_id,
      icon: "hugeicons:ai-brain-04",
      color: "secondary",
      isText: true,
    },
    {
      title: "Type",
      value: flow.type,
      icon: "hugeicons:tag-01",
      color: "warning",
      isText: true,
      capitalize: true,
    },
    {
      title: "Executions",
      value: totalExecutions,
      icon: "hugeicons:rocket-02",
      color: "success",
      isText: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <Button
            className="h-auto w-full justify-start p-0 text-left"
            variant="tertiary"
            onPress={() => {
              if (stat.isLink) {
                router.push(stat.link);
              }
            }}
          >
            <Card className="h-full border-none shadow-lg bg-surface/60 backdrop-blur-md border border-default">
              <Card.Content className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg bg-${stat.color}/20 text-${stat.color}`}
                  >
                    <Icon icon={stat.icon} width={20} />
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-muted">
                      {stat.title}
                    </p>
                    {stat.isText ? (
                      <p
                        className={`text-md font-bold text-foreground ${stat.capitalize ? "capitalize" : ""} ${stat.title === "Status" ? (stat.value === "Active" ? "text-success" : "text-danger") : ""}`}
                      >
                        {stat.value}
                      </p>
                    ) : (
                      <p className="text-xl font-bold text-foreground">
                        <NumberFlow value={stat.value} />
                      </p>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </Button>
        </motion.div>
      ))}
      {flow.disabled && (
        <div className="col-span-2 lg:col-span-5 mt-4">
          <Alert status={"danger"}>
            <Alert.Indicator></Alert.Indicator>
            <Alert.Content>
              <Alert.Title>{"Flow is currently disabled"}</Alert.Title>
              <Alert.Description>{flow.disabled_reason}</Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      )}
    </div>
  );
}
