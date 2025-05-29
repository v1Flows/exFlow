"use client";

import { Alert, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import NumberFlow from "@number-flow/react";
import { useRouter } from "next/navigation";

export default function FlowDetails({
  flow,
  project,
  totalExecutions,
  runners,
}: {
  flow: any;
  project: any;
  totalExecutions: any;
  runners: any;
}) {
  const router = useRouter();

  return (
    <main>
      <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
        <div className="col-span-1">
          <Card fullWidth className="h-full">
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:stethoscope-02" width={24} />
                </div>
                <div>
                  <p
                    className={`text-md font-bold ${flow.disabled ? "text-danger" : "text-success"}`}
                  >
                    {flow.disabled ? "Disabled" : "Active"}
                  </p>
                  <p className="text-sm text-default-500">Status</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-1">
          <Card
            fullWidth
            isHoverable
            isPressable
            className="h-full"
            onPress={() => {
              router.push(`/projects/${project.id}`);
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:ai-folder-01" width={24} />
                </div>
                <div>
                  <p className="text-md font-bold">{project.name}</p>
                  <p className="text-sm text-default-500">Project</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-1">
          <Card fullWidth className="h-full">
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:ai-brain-04" width={24} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    {runners.find((r: any) => r.id === flow.runner_id)?.name ||
                      flow.runner_id}
                  </p>
                  <p className="text-sm text-default-500">Runner</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-1">
          <Card fullWidth className="h-full">
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:rocket-02" width={24} />
                </div>
                <div>
                  <NumberFlow className="font-bold" value={totalExecutions} />
                  <p className="text-sm text-default-500">Executions</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      {flow.disabled && (
        <div className="mt-4 mb-4">
          <Alert
            color="danger"
            description={flow.disabled_reason}
            title="Flow is currently disabled"
            variant="faded"
          />
        </div>
      )}
    </main>
  );
}
