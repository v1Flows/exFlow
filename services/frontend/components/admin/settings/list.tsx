"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Switch,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import UpdateSettings from "@/lib/fetch/admin/PUT/UpdateSettings";

export function AdminSettings({ settings }: any) {
  const router = useRouter();

  const [maintenance, setMaintenance] = React.useState(settings.maintenance);
  const [signup, setSignup] = React.useState(settings.signup);
  const [createProjects, setCreateProjects] = React.useState(
    settings.create_projects,
  );
  const [createFlows, setCreateFlows] = React.useState(settings.create_flows);
  const [createRunners, setCreateRunners] = React.useState(
    settings.create_runners,
  );
  const [createTokens, setCreateTokens] = React.useState(
    settings.create_api_keys,
  );
  const [addProjectMembers, setAddProjectMembers] = React.useState(
    settings.add_project_members,
  );
  const [addFlowActions, setAddFlowActions] = React.useState(
    settings.add_flow_actions,
  );
  const [startExecutions, setStartExecutions] = React.useState(
    settings.start_executions,
  );
  const [receiveAlerts, setReceiveAlerts] = React.useState(
    settings.receive_alerts,
  );

  const [isLoading, setIsLoading] = React.useState(false);

  async function updateSettings() {
    setIsLoading(true);
    const response = (await UpdateSettings(
      maintenance,
      signup,
      createProjects,
      createFlows,
      createRunners,
      createTokens,
      addProjectMembers,
      addFlowActions,
      startExecutions,
      receiveAlerts,
      settings.allow_shared_runner_auto_join,
      settings.allow_shared_runner_join,
      settings.shared_runner_auto_join_token,
    )) as any;

    if (response.success) {
      setIsLoading(false);
      addToast({
        title: "Settings",
        description: "Settings updated successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setIsLoading(false);
      router.refresh();
      addToast({
        title: "Settings",
        description: "Failed to update settings",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-between gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${maintenance ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:wrench-01" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {maintenance ? "Active" : "Inactive"}
                    </p>
                    <Tooltip
                      content={
                        <p className="text-sm text-default-500">
                          {maintenance
                            ? "Users will see a maintenance page when they visit the website."
                            : "Users will be able to access the website normally."}
                        </p>
                      }
                    >
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Maintenance</p>
                </div>
              </div>
              <Switch
                color="danger"
                isSelected={maintenance}
                size="sm"
                onValueChange={setMaintenance}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${signup ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:user-add-01" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {signup ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent users from signing up.">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Sign Up</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={signup}
                size="sm"
                onValueChange={setSignup}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${createProjects ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:ai-folder-01" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {createProjects ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent users from creating new projects">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Create Projects</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={createProjects}
                size="sm"
                onValueChange={setCreateProjects}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${createFlows ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:workflow-square-10" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {createFlows ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent users from creating new flows">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Create Flows</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={createFlows}
                size="sm"
                onValueChange={setCreateFlows}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${createRunners ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:ai-brain-04" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {createRunners ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent users from creating new runners within projects">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Create Runners</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={createRunners}
                size="sm"
                onValueChange={setCreateRunners}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${createTokens ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:key-02" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {createTokens ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent users from creating new tokens within projects">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Create Tokens</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={createTokens}
                size="sm"
                onValueChange={setCreateTokens}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${addProjectMembers ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:location-user-02" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {addProjectMembers ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent project owners and editors from inviting new members to projects">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">
                    Invite Project Members
                  </p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={addProjectMembers}
                size="sm"
                onValueChange={setAddProjectMembers}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${addFlowActions ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:blockchain-06" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {addFlowActions ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent project owners & editors from adding new actions to any flow">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Add Flow Actions</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={addFlowActions}
                size="sm"
                onValueChange={setAddFlowActions}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex ${startExecutions ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-small`}
                >
                  <Icon icon="hugeicons:rocket-02" width={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-md font-bold">
                      {startExecutions ? "Enabled" : "Disabled"}
                    </p>
                    <Tooltip content="Disabling this option will prevent runners from starting a new executions">
                      <Icon
                        className="text-default-500"
                        icon="hugeicons:information-circle"
                        width={18}
                      />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-default-500">Start Executions</p>
                </div>
              </div>
              <Switch
                color="success"
                isSelected={startExecutions}
                size="sm"
                onValueChange={setStartExecutions}
              />
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="my-4 w-full">
        <Button
          className="w-full"
          color="primary"
          isLoading={isLoading}
          startContent={<Icon icon="hugeicons:floppy-disk" width={18} />}
          onPress={updateSettings}
        >
          Save Settings
        </Button>
      </div>
    </main>
  );
}
