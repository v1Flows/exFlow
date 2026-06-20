import {
  Chip,
  Drawer,
  Separator,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import TimeAgo from "react-timeago";
export default function RunnerDetails({
  disclosure,
  runner,
}: {
  disclosure: UseOverlayStateReturn;
  runner: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Dialog>
            {() => (
              <>
                <Drawer.Header>
                  <Drawer.Heading>
                    <h3 className="text-2xl font-semibold">{runner.name}</h3>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">ID</div>
                    <div className="text-sm font-medium">{runner.id}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">API URL</div>
                    <div className={"text-sm font-medium"}>
                      {runner.api_url || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Version</div>
                    <div className={"text-sm font-medium"}>
                      {runner.version || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Status</div>
                    <div className="text-sm font-medium">
                      {runner.executing_job ? "Executing Job" : "Idle"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Plugins</div>
                    <div className="text-sm font-medium">
                      {runner.plugins.length}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Actions</div>
                    <div className="text-sm font-medium">
                      {runner.actions.length}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Registered</div>
                    <div
                      className={`text-sm font-medium text-${runner.registered ? "success" : "danger"}`}
                    >
                      {runner.registered ? "Registered" : "Unregistered"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Registered At</div>
                    <div
                      className={`text-sm font-medium text-${runner.registered ? "success" : "danger"}`}
                    >
                      {new Date(runner.registered_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Last Heartbeat</div>
                    <div
                      className={`text-sm font-medium text-${heartbeatColor(runner)}`}
                    >
                      {runner.last_heartbeat !== "0001-01-01T00:00:00Z" && (
                        <TimeAgo date={runner.last_heartbeat} />
                      )}
                      {runner.last_heartbeat === "0001-01-01T00:00:00Z" &&
                        "N/A"}
                    </div>
                  </div>

                  <Separator />
                  <div className="text-sm text-muted">Plugin Details</div>
                  {runner.plugins
                    .sort((a: any, b: any) => a.type.localeCompare(b.type))
                    .map((plugin: any) => (
                      <div
                        key={plugin.name}
                        className="flex w-full flex-cols items-start justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-sm bg-default/30 text-foreground">
                            <Icon
                              icon={
                                plugin.type === "action"
                                  ? plugin.action.icon
                                  : plugin.endpoint.icon
                              }
                              width={20}
                            />
                          </div>
                          <div>
                            <p className="font-bold">{plugin.name}</p>
                            <p className="text-sm text-muted">
                              Creator: {plugin.author || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Chip color="accent">
                            <Chip.Label>
                              Version: {plugin.version || "N/A"}
                            </Chip.Label>
                          </Chip>
                          <Chip color="accent">
                            <Chip.Label>
                              Type: {plugin.type || "N/A"}
                            </Chip.Label>
                          </Chip>
                        </div>
                      </div>
                    ))}
                </Drawer.Body>
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
