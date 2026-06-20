"use client";
import { Icon } from "@iconify/react";
import { Button, Card, Switch, toast, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import UpdateSettings from "@/lib/fetch/admin/PUT/UpdateSettings";
export function AdminSystemSettings({ settings }: any) {
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
  const [receiveAlerts] = React.useState(settings.receive_alerts);
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
      toast.success("Settings", {
        description: "Settings updated successfully",
      });
      router.refresh();
    } else {
      setIsLoading(false);
      router.refresh();
      toast.danger("Settings", { description: "Failed to update settings" });
    }
  }
  return (
    <main>
      <Card>
        <Card.Header>
          <p className="text-lg font-bold">System Settings</p>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-between gap-4">
            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${maintenance ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:wrench-01" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {maintenance ? "Active" : "Inactive"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              <p className="text-sm text-muted">
                                {maintenance
                                  ? "Users will see a maintenance page when they visit the website."
                                  : "Users will be able to access the website normally."}
                              </p>
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Maintenance</p>
                    </div>
                  </div>
                  <Switch isSelected={maintenance} onChange={setMaintenance}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${signup ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:user-add-01" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {signup ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent users from signing up."
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Sign Up</p>
                    </div>
                  </div>
                  <Switch isSelected={signup} onChange={setSignup}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${createProjects ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:ai-folder-01" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {createProjects ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent users from creating new projects"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Create Projects</p>
                    </div>
                  </div>
                  <Switch
                    isSelected={createProjects}
                    onChange={setCreateProjects}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${createFlows ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:workflow-square-10" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {createFlows ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent users from creating new flows"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Create Flows</p>
                    </div>
                  </div>
                  <Switch isSelected={createFlows} onChange={setCreateFlows}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${createRunners ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:ai-brain-04" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {createRunners ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent users from creating new runners within projects"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Create Runners</p>
                    </div>
                  </div>
                  <Switch
                    isSelected={createRunners}
                    onChange={setCreateRunners}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${createTokens ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:key-02" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {createTokens ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent users from creating new tokens within projects"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Create Tokens</p>
                    </div>
                  </div>
                  <Switch isSelected={createTokens} onChange={setCreateTokens}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${addProjectMembers ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:location-user-02" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {addProjectMembers ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent project owners and editors from inviting new members to projects"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">
                        Invite Project Members
                      </p>
                    </div>
                  </div>
                  <Switch
                    isSelected={addProjectMembers}
                    onChange={setAddProjectMembers}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${addFlowActions ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:blockchain-06" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {addFlowActions ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent project owners & editors from adding new actions to any flow"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Add Flow Actions</p>
                    </div>
                  </div>
                  <Switch
                    isSelected={addFlowActions}
                    onChange={setAddFlowActions}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Content className="bg-surface-secondary">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex ${startExecutions ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"} size-10 items-center justify-center rounded-sm`}
                    >
                      <Icon icon="hugeicons:rocket-02" width={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-md font-bold">
                          {startExecutions ? "Enabled" : "Disabled"}
                        </p>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Icon
                              className="text-muted"
                              icon="hugeicons:information-circle"
                              width={18}
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            {
                              "Disabling this option will prevent runners from starting a new executions"
                            }
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted">Start Executions</p>
                    </div>
                  </div>
                  <Switch
                    isSelected={startExecutions}
                    onChange={setStartExecutions}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>
              </Card.Content>
            </Card>
          </div>
          <div className="mt-4 mb-2 w-full">
            <Button
              className="w-full"
              isPending={isLoading}
              onPress={updateSettings}
              variant="primary"
            >
              {<Icon icon="hugeicons:floppy-disk" width={18} />}
              Save Settings
            </Button>
          </div>
        </Card.Content>
      </Card>
    </main>
  );
}
