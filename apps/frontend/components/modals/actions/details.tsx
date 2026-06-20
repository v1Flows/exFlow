import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Checkbox,
  Drawer,
  Separator,
  Switch,
  Table,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
export default function FlowActionDetails({
  disclosure,
  flow,
  action,
}: {
  disclosure: UseOverlayStateReturn;
  flow?: any;
  action: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [showDefaultParams, setShowDefaultParams] = useState(false);
  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content>
          <Drawer.Dialog>
            {() => (
              <>
                <Drawer.Header>
                  <Drawer.Heading>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex size-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                        <Icon icon={action.icon} width={26} />
                      </div>
                      <div>
                        <div className="flex-cols flex gap-2">
                          <p className="text-md font-bold">
                            {action.custom_name || action.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted">
                          {action.custom_description || action.description}
                        </p>
                      </div>
                    </div>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">ID</div>
                    <CopySnippet showPrompt={false}>{action.id}</CopySnippet>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Plugin</div>
                    <div className={"text-sm font-medium"}>{action.plugin}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Plugin Name</div>
                    <div className={"text-sm font-medium"}>{action.name}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">Plugin Description</div>
                    <div className={"text-sm font-medium"}>
                      {action.description}
                    </div>
                  </div>
                  {flow && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted">Failure Pipeline</div>
                      <div className={"text-sm font-medium"}>
                        {flow.failure_pipeline_id === "" ||
                        flow.failure_pipeline_id === null ? (
                          flow.failure_pipelines.filter(
                            (pipeline: any) =>
                              pipeline.id === action.failure_pipeline_id,
                          )[0]?.name ||
                          action.failure_pipeline_id ||
                          "None"
                        ) : (
                          <span className="text-warning">
                            Overwritten by Flow Setting
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {action.params.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-cols items-center justify-between">
                        <p className="font-semibold">Parameters</p>
                        <Switch
                          isSelected={showDefaultParams}
                          onChange={setShowDefaultParams}
                        >
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Switch.Content>
                            Show default parameters
                          </Switch.Content>
                        </Switch>
                      </div>
                      <Table className="w-full">
                        <Table.ScrollContainer>
                          <Table.Content aria-label="Parameters">
                            <Table.Header>
                              <Table.Column className="text-center">
                                Key
                              </Table.Column>
                              <Table.Column className="text-center">
                                Value
                              </Table.Column>
                              <Table.Column className="text-center">
                                Note
                              </Table.Column>
                            </Table.Header>
                            <Table.Body
                              renderEmptyState={() =>
                                "No params defined or default values are used."
                              }
                            >
                              {action.params
                                .filter(
                                  (param: any) =>
                                    showDefaultParams ||
                                    param.value !== param.default,
                                )
                                .map((param: any, index: number) => (
                                  <Table.Row key={index} id={index}>
                                    <Table.Cell>{param.key}</Table.Cell>
                                    <Table.Cell>
                                      {param.type === "password"
                                        ? "••••••••"
                                        : param.value}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {param.type === "password" &&
                                      param.value != "" ? (
                                        <span className="text-success">
                                          Encrypted
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                            </Table.Body>
                          </Table.Content>
                        </Table.ScrollContainer>
                      </Table>
                    </>
                  )}

                  {flow && action.condition.selected_action_id !== "" && (
                    <>
                      <Separator />
                      <p className="font-semibold">Conditions</p>
                      <div className="mb-2">
                        <p>Options</p>
                        <Checkbox
                          isDisabled
                          isSelected={action.condition.cancel_execution}
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <span className="text-danger font-bold">
                              Cancel
                            </span>{" "}
                            Execution if conditions match and dont start any
                            following action.
                          </Checkbox.Content>
                        </Checkbox>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex size-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                          <Icon
                            icon={
                              flow.actions.filter(
                                (a: any) =>
                                  a.id === action.condition.selected_action_id,
                              )[0]?.icon
                            }
                            width={26}
                          />
                        </div>
                        <div>
                          <div className="flex-cols flex gap-2">
                            <p className="text-md font-bold">
                              {flow.actions.filter(
                                (a: any) =>
                                  a.id === action.condition.selected_action_id,
                              )[0]?.custom_name ||
                                flow.actions.filter(
                                  (a: any) =>
                                    a.id ===
                                    action.condition.selected_action_id,
                                )[0]?.name ||
                                action.condition.selected_action_id}
                            </p>
                          </div>
                          <p className="text-sm text-muted">
                            {flow.actions.filter(
                              (a: any) =>
                                a.id === action.condition.selected_action_id,
                            )[0]?.custom_description ||
                              flow.actions.filter(
                                (a: any) =>
                                  a.id === action.condition.selected_action_id,
                              )[0]?.description ||
                              "No description available"}
                          </p>
                        </div>
                      </div>
                      <Table className="w-full">
                        <Table.ScrollContainer>
                          <Table.Content aria-label="Details">
                            <Table.Header>
                              <Table.Column className="text-center">
                                Key
                              </Table.Column>
                              <Table.Column className="text-center">
                                Type
                              </Table.Column>
                              <Table.Column className="text-center">
                                Value
                              </Table.Column>
                              <Table.Column className="text-center">
                                Logic
                              </Table.Column>
                            </Table.Header>
                            <Table.Body
                              renderEmptyState={() => "No patterns defined."}
                            >
                              {action.condition.condition_items.map(
                                (condition: any, index: number) => (
                                  <Table.Row key={index} id={index}>
                                    <Table.Cell>
                                      {condition.condition_key}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {condition.condition_type}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {condition.condition_value}
                                    </Table.Cell>
                                    <Table.Cell className="text-accent font-semibold">
                                      {condition.condition_logic === "and"
                                        ? "&"
                                        : "or"}
                                    </Table.Cell>
                                  </Table.Row>
                                ),
                              )}
                            </Table.Body>
                          </Table.Content>
                        </Table.ScrollContainer>
                      </Table>
                    </>
                  )}
                </Drawer.Body>
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
