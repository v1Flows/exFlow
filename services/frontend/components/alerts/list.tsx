"use client";

import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  Chip,
  Listbox,
  ListboxItem,
  ScrollShadow,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import ReactTimeago from "react-timeago";

import { IconWrapper } from "@/lib/IconWrapper";
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

  return (
    <main>
      <div className="flex flex-col gap-4 p-4">
        {alerts.map((alert: any) => (
          <Card
            key={alert.id}
            fullWidth
            isHoverable
            isPressable
            className={`border-1 border-default-200`}
            onPress={() => {
              setTargetAlert(alert);
              alertDrawer.onOpenChange();
            }}
          >
            <CardBody>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-small bg-${alert.status === "firing" ? "danger" : "success"}/20 text-${alert.status === "firing" ? "danger" : "success"}`}
                  >
                    <Icon
                      icon={
                        alert.status === "firing"
                          ? "hugeicons:fire"
                          : "hugeicons:checkmark-badge-01"
                      }
                      width={24}
                    />
                  </div>
                  <div>
                    <p className="text-md font-bold">{alert.name || "N/A"}</p>
                    <p
                      className={`text-sm text-${alert.status === "firing" ? "danger" : "success"} capitalize`}
                    >
                      {alert.status || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {showFlowChip && (
                    <Chip color="default" radius="sm" size="sm" variant="flat">
                      Flow:{" "}
                      {
                        flows.filter((f: any) => f.id === alert.flow_id)[0]
                          ?.name
                      }
                    </Chip>
                  )}
                  {alert.execution_id !== "" && (
                    <Chip color="primary" radius="sm" size="sm" variant="solid">
                      Executed
                    </Chip>
                  )}
                  {alerts.filter((a: any) => a.parent_id === alert.id).length >
                    0 && (
                    <>
                      <Chip
                        color="primary"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        Parent Alert
                      </Chip>
                      <Chip
                        color="default"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        {
                          alerts.filter((a: any) => a.parent_id === alert.id)
                            .length
                        }{" "}
                        Sub Alert/s
                      </Chip>
                    </>
                  )}
                  {alert.updated_at !== "0001-01-01T00:00:00Z" && (
                    <Chip radius="sm" size="sm" variant="flat">
                      <span className="text-default-600">
                        Last Update: <ReactTimeago date={alert.updated_at} />
                      </span>
                    </Chip>
                  )}
                  <Chip radius="sm" size="sm" variant="flat">
                    <span className="text-default-600">
                      Created: <ReactTimeago date={alert.created_at} />
                    </span>
                  </Chip>
                </div>
              </div>

              <Spacer y={2} />

              {alerts.filter((a: any) => a.parent_id === alert.id).length >
                0 && (
                <Accordion isCompact variant="bordered">
                  <AccordionItem
                    key="grouped_alerts"
                    aria-label="Grouped Alerts"
                    title="Grouped Alerts"
                  >
                    <ScrollShadow className="max-h-[300px]" size={100}>
                      <Listbox
                        aria-label="User Menu"
                        className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 overflow-visible shadow-small rounded-medium"
                        itemClasses={{
                          base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
                        }}
                      >
                        {alerts.map((a: any) => {
                          if (a.parent_id === alert.id) {
                            return (
                              <ListboxItem
                                key={a.id}
                                className="group h-auto py-3 border-1 border-default-300"
                                startContent={
                                  <IconWrapper
                                    className={`bg-${a.status === "firing" ? "danger" : "success"}/10 text-${a.status === "firing" ? "danger" : "success"}`}
                                  >
                                    <Icon
                                      className="text-lg"
                                      icon={
                                        a.status === "firing"
                                          ? "hugeicons:fire"
                                          : "hugeicons:checkmark-badge-01"
                                      }
                                    />
                                  </IconWrapper>
                                }
                                textValue={a.name}
                                onPress={() => {
                                  setTargetAlert(a);
                                  alertDrawer.onOpenChange();
                                }}
                              >
                                <div className="flex flex-col gap-1">
                                  <span>{a.name}</span>
                                  <div className="px-2 py-1 rounded-small bg-default-100 group-data-[hover=true]:bg-default-200">
                                    <span
                                      className={`text-tiny text-${a.status === "firing" ? "danger" : "success"} capitalize`}
                                    >
                                      {a.status || "N/A"}
                                    </span>
                                    <div className="flex items-center gap-2 text-tiny">
                                      <span className="text-default-500">
                                        <ReactTimeago date={a.created_at} />
                                      </span>
                                      {new Date(a.created_at).getTime() ===
                                        Math.max(
                                          ...alerts
                                            .filter(
                                              (alert: any) =>
                                                alert.parent_id === a.parent_id,
                                            )
                                            .map((alert: any) =>
                                              new Date(
                                                alert.created_at,
                                              ).getTime(),
                                            ),
                                        ) && (
                                        <Chip
                                          color="success"
                                          radius="sm"
                                          size="sm"
                                          variant="flat"
                                        >
                                          Latest
                                        </Chip>
                                      )}
                                      {a.execution_id !== "" && (
                                        <Chip
                                          color="primary"
                                          radius="sm"
                                          size="sm"
                                          variant="flat"
                                        >
                                          Executed
                                        </Chip>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </ListboxItem>
                            );
                          }
                        })}
                      </Listbox>
                    </ScrollShadow>
                  </AccordionItem>
                </Accordion>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
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
