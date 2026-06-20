import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Card,
  Chip,
  Code,
  Drawer,
  Separator,
  useOverlayState,
  UseOverlayStateReturn,
} from "@heroui/react";
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
  disclosure: UseOverlayStateReturn;
  canEdit?: boolean;
  showDelete?: boolean;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const router = useRouter();
  const [showPayload, setShowPayload] = useState(false);
  const deleteAlertModal = useOverlayState();
  const handleDelete = () => {
    deleteAlertModal.open();
    onOpenChange(false);
  };
  if (!alert) return null;
  const isFiring = alert.status === "firing";
  const statusColor = isFiring ? "danger" : "success";
  return (
    <>
      <Drawer>
        <Drawer.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Drawer.Content>
            <Drawer.Dialog>
              {({ close: onClose }) => (
                <>
                  <Drawer.Header className="flex flex-col gap-4 pt-6 px-6">
                    <Drawer.Heading>
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
                              >
                                <Chip.Label>{alert.status}</Chip.Label>
                              </Chip>
                              <span className="text-xs text-muted">•</span>
                              <span className="text-xs text-muted">
                                <ReactTimeago date={alert.created_at} />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Chip
                            className="capitalize"
                            color={alert.encrypted ? "success" : "warning"}
                            variant="soft"
                          >
                            <Chip.Label>
                              {alert.encrypted ? "Encrypted" : "Unencrypted"}
                            </Chip.Label>
                          </Chip>
                        </div>
                      </div>
                    </Drawer.Heading>
                  </Drawer.Header>
                  <Separator className="opacity-50" />
                  <Drawer.Body className="px-6 py-4 gap-6">
                    {/* Alert Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-surface-secondary/50 border border-default/50 shadow-none">
                        <Card.Content className="p-3 gap-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Alert ID
                          </p>
                          <CopySnippet
                            codeClassName="font-mono text-sm"
                            showPrompt={false}
                          >
                            {alert.id}
                          </CopySnippet>
                        </Card.Content>
                      </Card>

                      <Card className="bg-surface-secondary/50 border border-default/50 shadow-none">
                        <Card.Content className="p-3 gap-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Execution ID
                          </p>
                          {alert.execution_id ? (
                            <CopySnippet
                              codeClassName="font-mono text-sm"
                              showPrompt={false}
                            >
                              {alert.execution_id}
                            </CopySnippet>
                          ) : (
                            <p className="text-sm text-muted">N/A</p>
                          )}
                        </Card.Content>
                      </Card>

                      <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Plugin
                          </p>
                          <p className="text-sm font-medium">
                            {alert.plugin || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Runner
                          </p>
                          <p className="text-sm font-medium">
                            {runners.find(
                              (runner: any) => runner.id === alert.runner_id,
                            )?.name || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Flow
                          </p>
                          <p className="text-sm font-medium">
                            {flows.find(
                              (flow: any) => flow.id === alert.flow_id,
                            )?.name || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted font-medium uppercase">
                            Group Key
                          </p>
                          <p className="text-sm font-medium break-all">
                            {alert.group_key || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-default border border-default">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted uppercase">
                          Created
                        </span>
                        <span className="text-sm font-medium">
                          <ReactTimeago date={alert.created_at} />
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted uppercase">
                          Updated
                        </span>
                        <span className="text-sm font-medium">
                          {alert.updated_at !== "0001-01-01T00:00:00Z" ? (
                            <ReactTimeago date={alert.updated_at} />
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted uppercase">
                          Resolved
                        </span>
                        <span className="text-sm font-medium">
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
                        <p className="text-xs font-bold text-warning uppercase mb-1">
                          Note
                        </p>
                        <p className="text-sm">{alert.note}</p>
                      </div>
                    )}

                    {/* Payload Toggle */}
                    <div>
                      <Button
                        className="justify-between bg-surface-secondary/50 hover:bg-surface-secondary border border-default"
                        onPress={() => setShowPayload(!showPayload)}
                      >
                        <span className="font-medium">Payload Data</span>
                        {
                          <Icon
                            icon={
                              showPayload
                                ? "hugeicons:arrow-up-01"
                                : "hugeicons:arrow-down-01"
                            }
                          />
                        }
                      </Button>
                      {showPayload && (
                        <div className="mt-2">
                          <CopySnippet
                            codeClassName="w-full whitespace-pre-wrap"
                            showPrompt={false}
                          >
                            <pre>{JSON.stringify(alert.payload, null, 2)}</pre>
                          </CopySnippet>
                        </div>
                      )}
                    </div>

                    {/* Involved Alerts Section */}
                    {alert.sub_alerts && alert.sub_alerts.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="text-muted"
                            icon="hugeicons:layers-01"
                          />
                          <h4 className="text-base font-bold">
                            Involved Alerts
                          </h4>
                          <Chip>
                            <Chip.Label>{alert.sub_alerts.length}</Chip.Label>
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
                                  className="group flex flex-col gap-3 p-3 rounded-lg bg-surface-secondary/30 hover:bg-surface-secondary/50 border border-default/50 transition-all"
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
                                        <p className="text-sm font-semibold">
                                          {sa.name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span
                                            className={`text-xs font-medium uppercase text-${childColor}`}
                                          >
                                            {sa.status}
                                          </span>
                                          <span className="text-xs text-muted">
                                            •
                                          </span>
                                          <span className="text-xs text-muted">
                                            <ReactTimeago
                                              date={sa.started_at}
                                            />
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
                                            <Chip key={key} color="default">
                                              <Chip.Label>
                                                {key}: {value}
                                              </Chip.Label>
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
                  </Drawer.Body>
                  <Separator className="opacity-50" />
                  <Drawer.Footer className="flex flex-wrap items-center justify-between px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        className="bg-accent/10 text-accent"
                        onPress={() => {
                          router.push(`/flows/${alert.flow_id}`);
                        }}
                      >
                        <Icon icon="hugeicons:workflow-square-10" width={18} />
                        Flow
                      </Button>
                      {alert.execution_id && (
                        <Button
                          className="bg-accent/10 text-accent"
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
                          isDisabled={!canEdit}
                          variant="danger"
                          onPress={() => handleDelete()}
                        >
                          <Icon icon="hugeicons:delete-02" width={18} />
                          Delete
                        </Button>
                      )}
                      <Button variant="ghost" onPress={onClose}>
                        Close
                      </Button>
                    </div>
                  </Drawer.Footer>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
      <DeleteAlertModal alert={alert} disclosure={deleteAlertModal} />
    </>
  );
}
