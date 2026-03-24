"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Chip,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import tinycolor from "tinycolor2";

import UpdateProject from "@/lib/fetch/project/PUT/UpdateProject";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import { projectIcons } from "@/config/project-icons";
import "react-color-palette/css";

export default function EditProjectModal({
  disclosure,
  project,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
}) {
  const { isOpen, onOpenChange } = disclosure;
  const { refreshProject } = useRefreshCache();

  const [color, setColor] = useColor("#5213d7");
  const safeColorHex = color.hex.replace("undefined", "");

  // Form State for Preview
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(
    "hugeicons:package-open",
  );
  const [sharedRunners, setSharedRunners] = useState("true");

  const [errors, setErrors] = React.useState({});
  const [apiError, setApiError] = React.useState(false);
  const [apiErrorText, setApiErrorText] = React.useState("");
  const [apiErrorMessage, setApiErrorMessage] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (project === undefined) return;

    setName(project.name);
    setDescription(project.description);
    setSelectedIcon(project.icon);
    setSharedRunners(project.shared_runners ? "true" : "false");

    const colorObj = tinycolor(project.color);

    setColor({
      hex: colorObj.toHexString(),
      rgb: colorObj.toRgb(),
      hsv: colorObj.toHsv(),
    });
  }, [disclosure.isOpen, project]);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await UpdateProject(
      project.id,
      data.name.toString(),
      data.description.toString(),
      data.sharedRunners === "true" ? true : false,
      selectedIcon || "hugeicons:package-open",
      safeColorHex,
      project.enable_auto_runners,
      project.disable_runner_join,
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update project");
      setApiErrorMessage("An error occurred while updating the project");
      addToast({
        title: "Project",
        description: "An error occurred while updating the project",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      refreshProject(project.id); // Refresh SWR cache instead of router
      onOpenChange();
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      setErrors({});
      addToast({
        title: "Project",
        description: "Project updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "Failed to update project",
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  };

  function cancel() {
    onOpenChange();
  }

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-content1/80 backdrop-blur-md border border-default-100",
          header: "border-b border-default-100",
          footer: "border-t border-default-100",
        }}
        isOpen={isOpen}
        placement="center"
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p className="text-xl font-bold">Edit Project</p>
                <p className="text-sm text-default-500 font-normal">
                  Update your project settings and preview the changes.
                </p>
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[500px]">
                  {/* Left Side: Form */}
                  <div className="p-6 lg:p-8 overflow-y-auto max-h-[70vh]">
                    {apiError && (
                      <div className="mb-6">
                        <ErrorCard
                          error={apiErrorText}
                          message={apiErrorMessage}
                        />
                      </div>
                    )}
                    <Form
                      className="w-full flex flex-col gap-8 items-stretch"
                      validationErrors={errors}
                      onSubmit={onSubmit}
                    >
                      <div className="flex flex-col gap-6 w-full">
                        <Input
                          isRequired
                          classNames={{
                            inputWrapper: "bg-default-50",
                          }}
                          label="Project Name"
                          labelPlacement="outside"
                          name="name"
                          placeholder="e.g. My Awesome Project"
                          radius="sm"
                          value={name}
                          variant="bordered"
                          onValueChange={setName}
                        />
                        <Textarea
                          isRequired
                          classNames={{
                            inputWrapper: "bg-default-50",
                          }}
                          label="Description"
                          labelPlacement="outside"
                          minRows={3}
                          name="description"
                          placeholder="Briefly describe your project..."
                          radius="sm"
                          value={description}
                          variant="bordered"
                          onValueChange={setDescription}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                          <Select
                            isRequired
                            classNames={{
                              trigger: "bg-default-50",
                            }}
                            defaultSelectedKeys={
                              project?.shared_runners ? ["true"] : ["false"]
                            }
                            label="Shared Runners"
                            labelPlacement="outside"
                            name="sharedRunners"
                            placeholder="Select option"
                            selectedKeys={[sharedRunners]}
                            variant="bordered"
                            onChange={(e) => setSharedRunners(e.target.value)}
                          >
                            <SelectItem
                              key="true"
                              startContent={
                                <Icon
                                  className="text-success"
                                  icon="hugeicons:check-circle"
                                />
                              }
                              textValue="Enabled"
                            >
                              Enabled
                            </SelectItem>
                            <SelectItem
                              key="false"
                              startContent={
                                <Icon
                                  className="text-danger"
                                  icon="hugeicons:cancel-circle"
                                />
                              }
                              textValue="Disabled"
                            >
                              Disabled
                            </SelectItem>
                          </Select>

                          <Autocomplete
                            defaultItems={projectIcons.map((icon) => ({
                              value: icon,
                              label: icon,
                            }))}
                            inputProps={{
                              classNames: {
                                inputWrapper: "bg-default-50",
                              },
                            }}
                            label="Project Icon"
                            labelPlacement="outside"
                            name="projectIcon"
                            placeholder="Search icon..."
                            selectedKey={selectedIcon}
                            variant="bordered"
                            onSelectionChange={(key) =>
                              setSelectedIcon(key as string)
                            }
                          >
                            {(item) => (
                              <AutocompleteItem
                                key={item.value}
                                textValue={item.label}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon icon={item.value} width={20} />
                                  <span className="text-small">
                                    {item.label.split(":")[1]}
                                  </span>
                                </div>
                              </AutocompleteItem>
                            )}
                          </Autocomplete>
                        </div>

                        <div className="space-y-2">
                          <p className="text-small font-medium">Brand Color</p>
                          <div className="p-4 rounded-lg border border-default-200 bg-default-50">
                            <ColorPicker
                              hideInput
                              color={color}
                              height={100}
                              onChange={setColor}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          className="flex-1"
                          color="primary"
                          isLoading={isLoading}
                          startContent={
                            !isLoading && (
                              <Icon
                                icon="hugeicons:pencil-edit-02"
                                width={20}
                              />
                            )
                          }
                          type="submit"
                        >
                          Save Changes
                        </Button>
                        <Button color="danger" variant="light" onPress={cancel}>
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </div>

                  {/* Right Side: Preview */}
                  <div className="hidden lg:flex flex-col bg-default-50/50 border-l border-default-100 p-8 items-center justify-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${safeColorHex} 0%, transparent 70%)`,
                      }}
                    />

                    <div className="w-full max-w-sm relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-small font-bold text-default-500 uppercase tracking-wider">
                          Live Preview
                        </p>
                        <Chip color="primary" size="sm" variant="flat">
                          Card View
                        </Chip>
                      </div>

                      {/* Preview Card */}
                      <Card className="w-full bg-content1/60 backdrop-blur-md shadow-lg border border-default-100">
                        <CardBody className="p-5">
                          <div className="flex flex-col h-full justify-between gap-4">
                            <div className="flex items-start justify-between gap-4">
                              <div
                                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform"
                                style={{
                                  background: `linear-gradient(135deg, ${safeColorHex}20 0%, ${safeColorHex}40 100%)`,
                                  color: safeColorHex,
                                  border: `1px solid ${safeColorHex}40`,
                                }}
                              >
                                <Icon
                                  className="text-2xl"
                                  icon={
                                    selectedIcon || "hugeicons:package-open"
                                  }
                                />
                              </div>
                              <Button
                                isDisabled
                                isIconOnly
                                size="sm"
                                variant="light"
                              >
                                <Icon
                                  className="text-lg text-default-400"
                                  icon="hugeicons:more-vertical-circle-01"
                                  width={20}
                                />
                              </Button>
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-bold text-lg text-default-900 line-clamp-1">
                                {name || "Project Name"}
                              </h3>
                              <p className="text-default-500 text-sm line-clamp-2 leading-relaxed min-h-[40px]">
                                {description ||
                                  "Project description will appear here..."}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-default-100 flex items-center justify-between">
                              <Chip
                                className="border-none pl-0"
                                color="success"
                                size="sm"
                                variant="dot"
                              >
                                Active
                              </Chip>
                              <div className="flex items-center gap-3 text-tiny text-default-400">
                                <div className="flex items-center gap-1">
                                  <Icon
                                    icon="hugeicons:user-group"
                                    width={14}
                                  />
                                  <span>{project?.members?.length || 1}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Icon
                                    icon="hugeicons:calendar-03"
                                    width={14}
                                  />
                                  <span>
                                    {new Date(
                                      project?.created_at || new Date(),
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Additional Info Preview */}
                      <div className="mt-8 p-4 rounded-xl border border-default-200 bg-background/60 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon
                            className="text-default-500"
                            icon="hugeicons:settings-01"
                          />
                          <span className="text-small font-medium">
                            Configuration
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-tiny text-default-500">
                          <div>
                            <span className="block uppercase text-[10px] font-bold mb-1">
                              Shared Runners
                            </span>
                            <span
                              className={
                                sharedRunners === "true"
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {sharedRunners === "true"
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                          <div>
                            <span className="block uppercase text-[10px] font-bold mb-1">
                              Theme Color
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: safeColorHex }}
                              />
                              <span className="font-mono">{safeColorHex}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
