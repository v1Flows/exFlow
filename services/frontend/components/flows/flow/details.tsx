"use client";

import { Alert, Card, CardBody } from "@heroui/react";
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
          <Card
            fullWidth
            isHoverable={!!stat.isLink}
            isPressable={!!stat.isLink}
            className="h-full border-none shadow-lg bg-content1/60 backdrop-blur-md border border-default-100"
            onPress={() => {
              if (stat.isLink) {
                router.push(stat.link);
              }
            }}
          >
            <CardBody className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg bg-${stat.color}/20 text-${stat.color}`}
                >
                  <Icon icon={stat.icon} width={20} />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-small font-medium text-default-500">
                    {stat.title}
                  </p>
                  {stat.isText ? (
                    <p
                      className={`text-md font-bold text-default-900 ${stat.capitalize ? "capitalize" : ""} ${stat.title === "Status" ? (stat.value === "Active" ? "text-success" : "text-danger") : ""}`}
                    >
                      {stat.value}
                    </p>
                  ) : (
                    <p className="text-xl font-bold text-default-900">
                      <NumberFlow value={stat.value} />
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
      {flow.disabled && (
        <div className="col-span-2 lg:col-span-5 mt-4">
          <Alert
            color="danger"
            description={flow.disabled_reason}
            title="Flow is currently disabled"
            variant="faded"
          />
        </div>
      )}
    </div>
  );
}
