import {
  addToast,
  Button,
  Card,
  CardBody,
  Spacer,
  Switch,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";

import UpdateFlow from "@/lib/fetch/flow/PUT/UpdateFlow";
import ErrorCard from "@/components/error/ErrorCard";
import canEditProject from "@/lib/functions/canEditProject";

export default function FlowSettings({
  flow,
  project,
  user,
}: {
  flow: any;
  project: any;
  user: any;
}) {
  const router = useRouter();

  const [encryptExecutions, setEncryptExecutions] = useState(
    flow.encrypt_executions,
  );
  const [encryptActionParams, setEncryptActionParams] = useState(
    flow.encrypt_action_params,
  );

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateFlow() {
    const response = (await UpdateFlow(
      flow.id,
      flow.name,
      flow.description,
      flow.project_id,
      flow.runner_id,
      encryptExecutions,
      encryptActionParams,
    )) as any;

    if (!response) {
      setError(true);
      setErrorMessage("An error occurred while updating the flow");

      return;
    }

    if (response.success) {
      router.refresh();
      addToast({
        title: "Flow",
        description: "Flow updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorMessage(response.message);
      addToast({
        title: "Flow",
        description: "Failed to update flow",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      {error && <ErrorCard error={error} message={errorMessage} />}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-bold mb-2">Encryption</p>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
            <Card>
              <CardBody>
                <div className="flex flex-cols items-center justify-between gap-8">
                  <div>
                    <p className="text-md font-bold">Action Parameters</p>
                    <p className="text-sm text-default-500">
                      The parameters of actions will be encrypted stored on the
                      db.
                    </p>
                  </div>
                  <Switch
                    isDisabled={!canEditProject(user.id, project.members)}
                    isSelected={encryptActionParams}
                    size="sm"
                    onValueChange={(value) => {
                      setEncryptActionParams(value);
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex flex-cols items-center justify-between gap-8">
                  <div>
                    <p className="text-md font-bold">Executions</p>
                    <p className="text-sm text-default-500">
                      All execution action messages will be stored encrypted on
                      the db
                    </p>
                  </div>
                  <Switch
                    isDisabled={!canEditProject(user.id, project.members)}
                    isSelected={encryptExecutions}
                    size="sm"
                    onValueChange={(value) => {
                      setEncryptExecutions(value);
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <Spacer y={4} />
      <Button
        fullWidth
        color="primary"
        isDisabled={!canEditProject(user.id, project.members)}
        startContent={<Icon icon="hugeicons:floppy-disk" width={20} />}
        onPress={updateFlow}
      >
        Save
      </Button>
    </>
  );
}
