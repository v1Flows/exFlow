import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Chip,
  Snippet,
  Code,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import { useDisclosure, UseDisclosureReturn } from "@heroui/use-disclosure";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactTimeago from "react-timeago";

import DeleteAlertModal from "./delete";

export default function AlertDrawer({
  alert,
  runners,
  flows,
  disclosure,
  canEdit,
  showDelete,
}: {
  alert: any;
  runners: any;
  flows: any;
  disclosure: UseDisclosureReturn;
  canEdit?: boolean;
  showDelete?: boolean;
}) {
  const { isOpen, onOpenChange } = disclosure;
  const router = useRouter();

  const [showPayload, setShowPayload] = useState(false);
  const deleteAlertModal = useDisclosure();

  const handleDelete = () => {
    deleteAlertModal.onOpen();
    onOpenChange();
  };

  if (!alert) return null;

  const isFiring = alert.status === "firing";
  const statusColor = isFiring ? "danger" : "success";

  return (
    <>
      <Drawer
        backdrop="blur"
        classNames={{
          base: "bg-content1/80 backdrop-blur-md border-l border-default-100",
        }}
        isOpen={isOpen}
        size="3xl"
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-4 pt-6 px-6">
                <div className="flex items-start justify-between gap-4">
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
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold leading-tight">
                        {alert.name || "Untitled Alert"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip
                          className="capitalize border-none"
                          color={statusColor}
                          size="sm"
                          variant="flat"
                        >
                          {alert.status}
                        </Chip>
                        <span className="text-tiny text-default-400">•</span>
                        <span className="text-tiny text-default-400">
                          <ReactTimeago date={alert.created_at} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Chip
                      className="capitalize"
                      color={alert.encrypted ? "success" : "warning"}
                      size="sm"
                      variant="dot"
                    >
                      {alert.encrypted ? "Encrypted" : "Unencrypted"}
                    </Chip>
                  </div>
                </div>
              </DrawerHeader>
              <Divider className="opacity-50" />
              <DrawerBody className="px-6 py-4 gap-6">
                {/* Alert Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-content2/50 border border-default-100/50 shadow-none">
                    <CardBody className="p-3 gap-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Alert ID
                      </p>
                      <Snippet
                        hideSymbol
                        classNames={{
                          base: "bg-transparent p-0",
                          pre: "font-mono text-small",
                        }}
                      >
                        {alert.id}
                      </Snippet>
                    </CardBody>
                  </Card>

                  <Card className="bg-content2/50 border border-default-100/50 shadow-none">
                    <CardBody className="p-3 gap-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Execution ID
                      </p>
                      {alert.execution_id ? (
                        <Snippet
                          hideSymbol
                          classNames={{
                            base: "bg-transparent p-0",
                            pre: "font-mono text-small",
                          }}
                        >
                          {alert.execution_id}
                        </Snippet>
                      ) : (
                        <p className="text-small text-default-400">N/A</p>
                      )}
                    </CardBody>
                  </Card>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Plugin
                      </p>
                      <p className="text-small font-medium">
                        {alert.plugin || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Runner
                      </p>
                      <p className="text-small font-medium">
                        {runners.find((runner: any) => runner.id === alert.runner_id)
                          ?.name || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Flow
                      </p>
                      <p className="text-small font-medium">
                        {flows.find((flow: any) => flow.id === alert.flow_id)?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-tiny text-default-500 font-medium uppercase">
                        Group Key
                      </p>
                      <p className="text-small font-medium break-all">
                        {alert.group_key || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-default-50 border border-default-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-tiny text-default-500 uppercase">
                      Created
                    </span>
                    <span className="text-small font-medium">
                      <ReactTimeago date={alert.created_at} />
                    </span>
                  </div>
                  <Divider orientation="vertical" className="h-8" />
                  <div className="flex flex-col gap-1">
                    <span className="text-tiny text-default-500 uppercase">
                      Updated
                    </span>
                    <span className="text-small font-medium">
                      {alert.updated_at !== "0001-01-01T00:00:00Z" ? (
                        <ReactTimeago date={alert.updated_at} />
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <Divider orientation="vertical" className="h-8" />
                  <div className="flex flex-col gap-1">
                    <span className="text-tiny text-default-500 uppercase">
                      Resolved
                    </span>
                    <span className="text-small font-medium">
                      {alert.resolved_at !== "0001-01-01T00:00:00Z" ? (
                        <ReactTimeago date={alert.resolved_at} />
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>

                {/* Note */}
                {alert.note && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-tiny font-bold text-warning uppercase mb-1">
                      Note
                    </p>
                    <p className="text-small">{alert.note}</p>
                  </div>
                )}

                {/* Payload Toggle */}
                <div>
                  <Button
                    fullWidth
                    className="justify-between bg-content2/50 hover:bg-content2 border border-default-100"
                    endContent={
                      <Icon
                        icon={
                          showPayload
                            ? "hugeicons:arrow-up-01"
                            : "hugeicons:arrow-down-01"
                        }
                      />
                    }
                    variant="flat"
                    onPress={() => setShowPayload(!showPayload)}
                  >
                    <span className="font-medium">Payload Data</span>
                  </Button>
                  {showPayload && (
                    <div className="mt-2">
                      <Snippet
                        hideSymbol
                        classNames={{
                          base: "w-full",
                          pre: "whitespace-pre-wrap",
                        }}
                      >
                        <pre>{JSON.stringify(alert.payload, null, 2)}</pre>
                      </Snippet>
                    </div>
                  )}
                </div>

                {/* Involved Alerts Section */}
                {alert.sub_alerts && alert.sub_alerts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:layers-01"
                      />
                      <h4 className="text-medium font-bold">Involved Alerts</h4>
                      <Chip size="sm" variant="flat">
                        {alert.sub_alerts.length}
                      </Chip>
                    </div>

                    <div className="flex flex-col gap-2">
                      {alert.sub_alerts
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                        )
                        .map((sa: any) => {
                          const isChildFiring = sa.status === "firing";
                          const childColor = isChildFiring
                            ? "danger"
                            : "success";

                          return (
                            <div
                              key={sa.id}
                              className="group flex flex-col gap-3 p-3 rounded-lg bg-content2/30 hover:bg-content2/50 border border-default-100/50 transition-all"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex-shrink-0 size-8 rounded-lg bg-${childColor}/10 flex items-center justify-center text-${childColor}`}
                                  >
                                    <Icon
                                      icon={
                                        isChildFiring
                                          ? "hugeicons:fire"
                                          : "hugeicons:checkmark-badge-01"
                                      }
                                      width={16}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-small font-semibold">
                                      {sa.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-tiny font-medium uppercase text-${childColor}`}
                                      >
                                        {sa.status}
                                      </span>
                                      <span className="text-tiny text-default-400">
                                        •
                                      </span>
                                      <span className="text-tiny text-default-400">
                                        <ReactTimeago date={sa.started_at} />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {sa.labels &&
                                Object.keys(sa.labels).length > 0 && (
                                  <div className="flex flex-wrap gap-1 pl-11">
                                    {Object.entries(sa.labels).map(
                                      ([key, value]: [string, any]) => (
                                        <Chip
                                          key={key}
                                          classNames={{
                                            content:
                                              "font-mono text-[10px] font-medium",
                                          }}
                                          color="default"
                                          size="sm"
                                          variant="flat"
                                        >
                                          {key}: {value}
                                        </Chip>
                                      ),
                                    )}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </DrawerBody>
              <Divider className="opacity-50" />
              <DrawerFooter className="flex flex-wrap items-center justify-between px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    className="bg-primary/10 text-primary"
                    size="sm"
                    variant="flat"
                    onPress={() => {
                      router.push(`/flows/${alert.flow_id}`);
                    }}
                  >
                    <Icon icon="hugeicons:workflow-square-10" width={18} />
                    Flow
                  </Button>
                  {alert.execution_id && (
                    <Button
                      className="bg-primary/10 text-primary"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        router.push(
                          `/flows/${alert.flow_id}/execution/${alert.execution_id}`,
                        );
                      }}
                    >
                      <Icon icon="hugeicons:rocket-02" width={18} />
                      Execution
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {showDelete && (
                    <Button
                      color="danger"
                      isDisabled={!canEdit}
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete()}
                    >
                      <Icon icon="hugeicons:delete-02" width={18} />
                      Delete
                    </Button>
                  )}
                  <Button size="sm" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <DeleteAlertModal alert={alert} disclosure={deleteAlertModal} />
    </>
  );
}
