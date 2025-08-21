import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Snippet,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function FlowActionDetails({
  disclosure,
  flow,
  action,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
  action: any;
}) {
  const { isOpen, onOpenChange } = disclosure;

  const [showDefaultParams, setShowDefaultParams] = useState(false);

  return (
    <Drawer isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon={action.icon} width={26} />
                </div>
                <div>
                  <div className="flex-cols flex gap-2">
                    <p className="text-md font-bold">
                      {action.custom_name || action.name}
                    </p>
                  </div>
                  <p className="text-sm text-default-500">
                    {action.custom_description || action.description}
                  </p>
                </div>
              </div>
            </DrawerHeader>
            <DrawerBody>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">ID</div>
                <Snippet hideSymbol size="sm">
                  {action.id}
                </Snippet>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Plugin</div>
                <div className={"text-small font-medium"}>{action.plugin}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">Plugin Name</div>
                <div className={"text-small font-medium"}>{action.name}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">
                  Plugin Description
                </div>
                <div className={"text-small font-medium"}>
                  {action.description}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-small text-default-500">
                  Failure Pipeline
                </div>
                <div className={"text-small font-medium"}>
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

              {action.params.length > 0 && (
                <>
                  <Divider />
                  <div className="flex flex-cols items-center justify-between">
                    <p className="font-semibold">Parameters</p>
                    <Switch
                      isSelected={showDefaultParams}
                      size="sm"
                      onValueChange={setShowDefaultParams}
                    >
                      Show default parameters
                    </Switch>
                  </div>
                  <Table
                    removeWrapper
                    aria-label="Parameters"
                    className="w-full"
                  >
                    <TableHeader>
                      <TableColumn align="center">Key</TableColumn>
                      <TableColumn align="center">Value</TableColumn>
                      <TableColumn align="center">Note</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No params defined or default values are used.">
                      {action.params
                        .filter(
                          (param: any) =>
                            showDefaultParams || param.value !== param.default,
                        )
                        .map((param: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{param.key}</TableCell>
                            <TableCell>
                              {param.type === "password"
                                ? "••••••••"
                                : param.value}
                            </TableCell>
                            <TableCell>
                              {param.type === "password" &&
                              param.value != "" ? (
                                <span className="text-success">Encrypted</span>
                              ) : (
                                ""
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {action.condition.selected_action_id !== "" && (
                <>
                  <Divider />
                  <p className="font-semibold">Conditions</p>
                  <div className="mb-2">
                    <p>Options</p>
                    <Checkbox
                      isDisabled
                      color="danger"
                      isSelected={action.condition.cancel_execution}
                    >
                      <span className="text-danger font-bold">Cancel</span>{" "}
                      Execution if conditions match and dont start any following
                      action.
                    </Checkbox>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
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
                                a.id === action.condition.selected_action_id,
                            )[0]?.name ||
                            action.condition.selected_action_id}
                        </p>
                      </div>
                      <p className="text-sm text-default-500">
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
                  <Table removeWrapper aria-label="Details" className="w-full">
                    <TableHeader>
                      <TableColumn align="center">Key</TableColumn>
                      <TableColumn align="center">Type</TableColumn>
                      <TableColumn align="center">Value</TableColumn>
                      <TableColumn align="center">Logic</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No patterns defined.">
                      {action.condition.condition_items.map(
                        (condition: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{condition.condition_key}</TableCell>
                            <TableCell>{condition.condition_type}</TableCell>
                            <TableCell>{condition.condition_value}</TableCell>
                            <TableCell className="text-primary font-semibold">
                              {condition.condition_logic === "and" ? "&" : "or"}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
