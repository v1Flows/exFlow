"use client";

import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Chip,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import ReactTimeago from "react-timeago";
import { motion } from "framer-motion";

import AlertDrawer from "@/components/modals/alerts/details";

export default function AlertsList({
  alerts,
  runners,
  flows,
  canEdit,
  showDelete,
  showFlowChip,
}: {
  alerts: any;
  runners: any;
  flows?: any;
  canEdit?: boolean;
  showDelete?: boolean;
  showFlowChip?: boolean;
}) {
  const alertDrawer = useDisclosure();
  const [targetAlert, setTargetAlert] = useState<any>(null);

  const parentAlerts = alerts.filter((a: any) => a.parent_id === "");

  const getChildren = (parentId: string) =>
    alerts.filter((a: any) => a.parent_id === parentId);

  return (
    <main className="w-full">
      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {parentAlerts.map((alert: any) => {
          const children = getChildren(alert.id);
          const hasChildren = children.length > 0;
          const isFiring = alert.status === "firing";
          const statusColor = isFiring ? "danger" : "success";

          return (
            <motion.div
              key={alert.id}
              className="pr-4 pl-4"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <Card className="w-full bg-content1/60 backdrop-blur-md border border-default-100 transition-all">
                <CardBody className="p-0">
                  <div className="flex flex-col w-full">
                    {/* Main Alert Content */}
                    <div
                      className="flex items-start justify-between gap-4 w-full p-4 cursor-pointer hover:bg-content1/50 transition-colors"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setTargetAlert(alert);
                        alertDrawer.onOpenChange();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setTargetAlert(alert);
                          alertDrawer.onOpenChange();
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-shrink-0 size-12 rounded-xl bg-${statusColor}/10 flex items-center justify-center text-${statusColor}`}
                        >
                          <Icon
                            icon={
                              isFiring
                                ? "hugeicons:fire"
                                : "hugeicons:checkmark-badge-01"
                            }
                            width={24}
                          />
                        </div>
                        <div className="flex flex-col items-start">
                          <h4 className="text-lg font-bold leading-tight text-left">
                            {alert.name || "Unnamed Alert"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-medium uppercase tracking-wider text-${statusColor}`}
                            >
                              {alert.status}
                            </span>
                            <span className="text-tiny text-default-400">
                              •
                            </span>
                            <span className="text-tiny text-default-400">
                              <ReactTimeago date={alert.created_at} />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {showFlowChip && (
                          <Chip
                            className="bg-default-100"
                            size="sm"
                            variant="flat"
                          >
                            Flow:{" "}
                            {flows.find((f: any) => f.id === alert.flow_id)
                              ?.name || "Unknown"}
                          </Chip>
                        )}
                        {alert.execution_id && (
                          <Chip color="primary" size="sm" variant="flat">
                            Executed
                          </Chip>
                        )}
                      </div>
                    </div>

                    {/* Grouped Alerts Section */}
                    {hasChildren && (
                      <div className="w-full px-4 pb-4">
                        <div className="w-full pt-2 border-t border-default-100/50">
                          <Accordion
                            className="px-0"
                            isCompact={true}
                            variant="light"
                          >
                            <AccordionItem
                              key="related"
                              aria-label="Related Alerts"
                              classNames={{
                                trigger: "py-2",
                                title: "text-small text-default-500",
                              }}
                              startContent={
                                <Icon
                                  className="text-default-400"
                                  icon="hugeicons:layers-01"
                                />
                              }
                              title={`${children.length} Related Event${children.length !== 1 ? "s" : ""}`}
                            >
                              <div className="flex flex-col gap-2 pl-2 pb-2">
                                {children.map((child: any) => (
                                  <div
                                    key={child.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-default-50/50 hover:bg-default-100/50 cursor-pointer transition-colors border border-default-200/50"
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTargetAlert(child);
                                      alertDrawer.onOpenChange();
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.stopPropagation();
                                        setTargetAlert(child);
                                        alertDrawer.onOpenChange();
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Icon
                                        className={
                                          child.status === "firing"
                                            ? "text-danger"
                                            : "text-success"
                                        }
                                        icon={
                                          child.status === "firing"
                                            ? "hugeicons:fire"
                                            : "hugeicons:checkmark-badge-01"
                                        }
                                      />
                                      <span className="text-sm font-medium">
                                        {child.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-default-400">
                                      <ReactTimeago date={child.created_at} />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <AlertDrawer
        alert={targetAlert}
        canEdit={canEdit}
        disclosure={alertDrawer}
        flows={flows}
        runners={runners}
        showDelete={showDelete}
      />
    </main>
  );
}
