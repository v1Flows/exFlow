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
  Listbox,
  ListboxItem,
} from "@heroui/react";
import { useDisclosure, UseDisclosureReturn } from "@heroui/use-disclosure";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactTimeago from "react-timeago";

import { IconWrapper } from "@/lib/IconWrapper";

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

  return (
    <>
      <Drawer isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col">
                <div className="flex flex-cols items-center gap-2">
                  {alert.name || "Untitled"}
                  <Chip
                    className="capitalize"
                    color={alert.status === "resolved" ? "success" : "danger"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {alert.status}
                  </Chip>
                  <Chip
                    className="capitalize"
                    color={alert.encrypted ? "success" : "warning"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {alert.encrypted ? "Encrypted" : "Unencrypted"}
                  </Chip>
                </div>
              </DrawerHeader>
              <Divider />
              <DrawerBody>
                <div className="grid grid-cols-3 items-center gap-3">
                  <p className="font-bold text-default-500 col-span-1">ID</p>
                  <Snippet
                    hideSymbol
                    className="col-span-2"
                    size="sm"
                    variant="flat"
                  >
                    {alert.id}
                  </Snippet>

                  <p className="font-bold text-default-500 col-span-1">
                    Plugin
                  </p>
                  <p className="text-sm col-span-2">{alert.plugin || "N/A"}</p>

                  <p className="font-bold text-default-500 col-span-1">
                    Runner
                  </p>
                  <p className="text-sm col-span-2">
                    {runners.find((runner) => runner.id === alert.runner_id)
                      ?.name || "N/A"}
                  </p>

                  <p className="font-bold text-default-500 col-span-1">Flow</p>
                  <p className="text-sm col-span-2">
                    {flows.find((flow) => flow.id === alert.flow_id)?.name ||
                      "N/A"}
                  </p>

                  <p className="font-bold text-default-500 col-span-1">
                    Group Ident
                  </p>
                  <p className="text-sm col-span-2">
                    {alert.group_key || "N/A"}
                  </p>

                  <p className="font-bold text-default-500 col-span-1">
                    Execution ID
                  </p>
                  <Snippet
                    hideSymbol
                    className="col-span-2"
                    size="sm"
                    variant="flat"
                  >
                    {alert.execution_id || "N/A"}
                  </Snippet>

                  {alert.parent_id && (
                    <>
                      <p className="font-bold text-default-500 col-span-1">
                        Parent Alert
                      </p>
                      <Code className="col-span-2">
                        {alert.parent_id || "N/A"}
                      </Code>
                    </>
                  )}

                  <p className="font-bold text-default-500 col-span-1">
                    Payload
                  </p>
                  <Button
                    className="col-span-2"
                    color="primary"
                    size="sm"
                    variant="flat"
                    onPress={() => setShowPayload(!showPayload)}
                  >
                    {showPayload ? "Hide" : "Show"} Payload
                  </Button>

                  <p className="font-bold text-default-500 col-span-1">
                    Created At
                  </p>
                  <span className="col-span-2">
                    <ReactTimeago date={alert.created_at} />
                  </span>

                  <p className="font-bold text-default-500 col-span-1">
                    Updated At
                  </p>
                  <span className="col-span-2">
                    {alert.updated_at !== "0001-01-01T00:00:00Z" ? (
                      <ReactTimeago date={alert.updated_at} />
                    ) : (
                      "N/A"
                    )}
                  </span>

                  <p className="font-bold text-default-500 col-span-1">
                    Resolved At
                  </p>
                  <span className="col-span-2">
                    {alert.resolved_at !== "0001-01-01T00:00:00Z" ? (
                      <ReactTimeago date={alert.resolved_at} />
                    ) : (
                      "N/A"
                    )}
                  </span>

                  {alert.note && (
                    <>
                      <Divider className="col-span-3" />
                      <p className="font-bold col-span-1">Note</p>
                      <span className="col-span-2 font-bold">{alert.note}</span>
                    </>
                  )}
                </div>

                {showPayload && (
                  <Snippet hideSymbol>
                    <pre>{JSON.stringify(alert.payload, null, 2)}</pre>
                  </Snippet>
                )}

                {alert.sub_alerts.length > 0 && (
                  <>
                    <Divider />
                    <p className="font-bold">Involved Alerts</p>
                    <Listbox
                      aria-label="User Menu"
                      className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 overflow-visible shadow-small rounded-medium"
                      itemClasses={{
                        base: "px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-12 data-[hover=true]:bg-default-100/80",
                      }}
                    >
                      {alert.sub_alerts
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                        )
                        .map((sa: any) => {
                          return (
                            <ListboxItem
                              key={sa.id}
                              className="group h-auto py-3 border-1 border-default-300"
                              startContent={
                                <IconWrapper
                                  className={`bg-${sa.status === "firing" ? "danger" : "success"}/10 text-${sa.status === "firing" ? "danger" : "success"}`}
                                >
                                  <Icon
                                    className="text-lg"
                                    icon={
                                      sa.status === "firing"
                                        ? "hugeicons:fire"
                                        : "hugeicons:checkmark-badge-01"
                                    }
                                  />
                                </IconWrapper>
                              }
                              textValue={sa.name}
                            >
                              <div className="flex flex-col gap-1">
                                <span>{sa.name}</span>
                                <div className="px-2 py-1 rounded-small bg-default-100 group-data-[hover=true]:bg-default-200">
                                  <span
                                    className={`text-tiny text-${sa.status === "firing" ? "danger" : "success"} capitalize`}
                                  >
                                    {sa.status || "N/A"}
                                  </span>
                                  <div className="flex gap-2 text-tiny">
                                    <span className="text-default-500">
                                      Started:{" "}
                                      <ReactTimeago date={sa.started_at} />
                                    </span>
                                    {sa.resolved_at !==
                                      "0001-01-01T00:00:00Z" && (
                                      <span className="text-default-500">
                                        Resolved:{" "}
                                        <ReactTimeago date={sa.resolved_at} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap mt-1 gap-2">
                                  {Object.entries(sa.labels).map(
                                    ([key, value]: [string, any]) => {
                                      return (
                                        <Chip
                                          key={key}
                                          radius="sm"
                                          size="sm"
                                          variant="flat"
                                        >
                                          {key}: {value}
                                        </Chip>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </ListboxItem>
                          );
                        })}
                    </Listbox>
                  </>
                )}
              </DrawerBody>
              <DrawerFooter className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      router.push(`/flows/${alert.flow_id}`);
                    }}
                  >
                    <Icon icon="hugeicons:workflow-square-10" width={20} />
                    View Flow
                  </Button>
                  {alert.execution_id && (
                    <Button
                      color="primary"
                      onPress={() => {
                        router.push(
                          `/flows/${alert.flow_id}/execution/${alert.execution_id}`,
                        );
                      }}
                    >
                      <Icon icon="hugeicons:rocket-02" width={20} />
                      View Execution
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {showDelete && (
                    <Button
                      color="danger"
                      isDisabled={!canEdit}
                      variant="flat"
                      onPress={() => handleDelete()}
                    >
                      <Icon icon="hugeicons:delete-02" width={20} />
                      Delete
                    </Button>
                  )}
                  <Button color="default" variant="flat" onPress={onClose}>
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
