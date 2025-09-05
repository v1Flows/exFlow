import { Card, CardBody, Spacer } from "@heroui/react";
import { Icon } from "@iconify/react";
import NumberFlow from "@number-flow/react";

export default function AlertsHeading({ alerts }: any) {
  return (
    <main>
      <div className="grid grid-cols-1 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Alerts</p>
        <div className="mt-2 lg:mt-0 lg:justify-self-end">
          {/* <Reloader /> */}
        </div>
      </div>
      <Spacer y={4} />

      <div className="grid grid-cols-3 gap-4 lg:grid-cols-3">
        <div className="col-span-1">
          <Card fullWidth>
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-danger/10 text-danger">
                  <Icon icon="hugeicons:fire" width={24} />
                </div>
                <div>
                  <p className="text-md font-bold text-danger">
                    <NumberFlow
                      locales="en-US"
                      value={
                        alerts.filter((alert: any) => alert.status === "firing")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Firing</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-1">
          <Card fullWidth>
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-success/10 text-success">
                  <Icon icon="hugeicons:checkmark-badge-02" width={24} />
                </div>
                <div>
                  <p className="text-md font-bold text-success">
                    <NumberFlow
                      locales="en-US"
                      value={
                        alerts.filter(
                          (alert: any) => alert.status === "resolved",
                        ).length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Resolved</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-1">
          <Card fullWidth>
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:task-01" width={24} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow locales="en-US" value={alerts.length} />
                  </p>
                  <p className="text-sm text-default-500">Total</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}
