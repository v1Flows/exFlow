import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  Chip,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@heroui/react";
import TimeAgo from "react-timeago";

export default function RunnerDrawer({
  disclosure,
  runner,
}: {
  disclosure: UseDisclosureReturn;
  runner: any;
}) {
  const { isOpen, onOpenChange } = disclosure;

  function heartbeatColor(runner: any) {
    const timeAgo =
      (new Date(runner.last_heartbeat).getTime() - Date.now()) / 1000;

    if (timeAgo < 0 && timeAgo > -30) {
      return "success";
    } else if (timeAgo <= -30 && timeAgo > -60) {
      return "warning";
    } else if (timeAgo <= -60) {
      return "danger";
    }
  }

  return (
    <Drawer isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader>
              <h3 className="text-2xl font-semibold">{runner.name}</h3>
            </DrawerHeader>
            <DrawerBody>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">ID</div>
                <div className="text-small font-medium">{runner.id}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Registered</div>
                <div
                  className={`text-small font-medium text-${runner.registered ? "success" : "danger"}`}
                >
                  {runner.registered ? "Registered" : "Unregistered"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Registered At</div>
                <div
                  className={`text-small font-medium text-${runner.registered ? "success" : "danger"}`}
                >
                  {new Date(runner.registered_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">
                  Last Heartbeat
                </div>
                <div
                  className={`text-small font-medium text-${heartbeatColor(runner)}`}
                >
                  {runner.last_heartbeat !== "0001-01-01T00:00:00Z" && (
                    <TimeAgo date={runner.last_heartbeat} />
                  )}
                  {runner.last_heartbeat === "0001-01-01T00:00:00Z" && "N/A"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Status</div>
                <div className="text-small font-medium">
                  {runner.executing_job ? "Executing Job" : "Idle"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Plugins</div>
                <div className="text-small font-medium">
                  {runner.plugins.length}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Actions</div>
                <div className="text-small font-medium">
                  {runner.actions.length}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">
                  Alert Endpoints
                </div>
                <div className="text-small font-medium">
                  {runner.alert_endpoints.length}
                </div>
              </div>

              <Divider />
              <div className="text-small text-default-500">Plugin Details</div>
              {runner.plugins.map((plugin: any) => (
                <div
                  key={plugin.name}
                  className="flex w-full flex-cols items-start justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                      <Icon
                        icon={
                          plugin.type === "action"
                            ? "solar:bolt-linear"
                            : "solar:letter-opened-linear"
                        }
                        width={20}
                      />
                    </div>
                    <div>
                      <p className="font-bold">{plugin.name}</p>
                      <p className="text-sm text-default-500">
                        Creator: {plugin.author || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Chip color="primary" radius="sm" size="sm" variant="flat">
                      Version: {plugin.version || "N/A"}
                    </Chip>
                    <Chip
                      color="secondary"
                      radius="sm"
                      size="sm"
                      variant="flat"
                    >
                      Type: {plugin.type || "N/A"}
                    </Chip>
                  </div>
                </div>
              ))}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
