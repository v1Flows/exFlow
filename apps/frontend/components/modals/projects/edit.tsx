"use client";
import {
  Button,
  Card,
  Chip,
  ComboBox,
  Description,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
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
  disclosure: UseOverlayStateReturn;
  project: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
      toast.danger("Project", {
        description: "An error occurred while updating the project",
      });
      return;
    }
    if (res.success) {
      refreshProject(project.id); // Refresh SWR cache instead of router
      onOpenChange(false);
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      setErrors({});
      toast.success("Project", { description: "Project updated successfully" });
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      toast.danger("Project", { description: "Failed to update project" });
    }
    setIsLoading(false);
  };
  function cancel() {
    onOpenChange(false);
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog>
              {() => (
                <>
                  <Modal.Header className="flex flex-col gap-1">
                    <Modal.Heading>
                      <p className="text-xl font-bold">Edit Project</p>
                      <p className="text-sm text-muted font-normal">
                        Update your project settings and preview the changes.
                      </p>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="p-0">
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
                            <TextField
                              isRequired
                              name="name"
                              value={name}
                              onChange={setName}
                            >
                              <Label>{"Project Name"}</Label>
                              <InputGroup>
                                <Input placeholder="e.g. My Awesome Project" />
                              </InputGroup>
                            </TextField>
                            <TextField
                              isRequired
                              name={"description"}
                              value={description}
                              onChange={setDescription}
                            >
                              <Label>{"Description"}</Label>
                              <TextArea
                                placeholder={"Briefly describe your project..."}
                              />
                            </TextField>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                              <Select
                                defaultSelectedKey={
                                  Array.from(
                                    project?.shared_runners
                                      ? ["true"]
                                      : ["false"],
                                  )[0] ?? null
                                }
                                isRequired
                                name="sharedRunners"
                                placeholder="Select option"
                                selectedKey={sharedRunners}
                                onSelectionChange={(key) =>
                                  setSharedRunners(String(key ?? ""))
                                }
                              >
                                <Label>{"Shared Runners"}</Label>
                                <Select.Trigger>
                                  <Select.Value />
                                  <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                  <ListBox>
                                    <ListBox.Item
                                      key="true"
                                      textValue="Enabled"
                                      id="true"
                                    >
                                      Enabled
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    <ListBox.Item
                                      key="false"
                                      textValue="Disabled"
                                      id="false"
                                    >
                                      Disabled
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  </ListBox>
                                </Select.Popover>
                              </Select>

                              <ComboBox
                                name="projectIcon"
                                selectedKey={selectedIcon}
                                onSelectionChange={(key) =>
                                  setSelectedIcon(String(key ?? ""))
                                }
                              >
                                <Label>Project Icon</Label>
                                <ComboBox.InputGroup>
                                  <Input placeholder="Search icon..." />
                                  <ComboBox.Trigger />
                                </ComboBox.InputGroup>
                                <ComboBox.Popover>
                                  <ListBox>
                                    {projectIcons.map((icon) => (
                                      <ListBox.Item
                                        key={icon}
                                        id={icon}
                                        textValue={icon}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Icon icon={icon} width={20} />
                                          <span className="text-sm">
                                            {icon.split(":")[1]}
                                          </span>
                                        </div>
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ))}
                                  </ListBox>
                                </ComboBox.Popover>
                              </ComboBox>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Brand Color</p>
                              <div className="p-4 rounded-lg border border-default bg-default">
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
                              isPending={isLoading}
                              type="submit"
                              variant="primary"
                            >
                              {!isLoading && (
                                <Icon
                                  icon="hugeicons:pencil-edit-02"
                                  width={20}
                                />
                              )}
                              Save Changes
                            </Button>
                            <Button variant="danger" onPress={cancel}>
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      </div>

                      {/* Right Side: Preview */}
                      <div className="hidden lg:flex flex-col bg-default/50 border-l border-default p-8 items-center justify-center relative overflow-hidden">
                        {/* Background decoration */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${safeColorHex} 0%, transparent 70%)`,
                          }}
                        />

                        <div className="w-full max-w-sm relative z-10">
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-bold text-muted uppercase tracking-wider">
                              Live Preview
                            </p>
                            <Chip color="accent">
                              <Chip.Label>Card View</Chip.Label>
                            </Chip>
                          </div>

                          {/* Preview Card */}
                          <Card className="w-full bg-surface/60 backdrop-blur-md shadow-lg border border-default">
                            <Card.Content className="p-5">
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
                                    variant="ghost"
                                    className="aspect-square p-0"
                                  >
                                    <Icon
                                      className="text-lg text-muted"
                                      icon="hugeicons:more-vertical-circle-01"
                                      width={20}
                                    />
                                  </Button>
                                </div>

                                <div className="space-y-1">
                                  <h3 className="font-bold text-lg text-foreground line-clamp-1">
                                    {name || "Project Name"}
                                  </h3>
                                  <p className="text-muted text-sm line-clamp-2 leading-relaxed min-h-[40px]">
                                    {description ||
                                      "Project description will appear here..."}
                                  </p>
                                </div>

                                <div className="pt-4 border-t border-default flex items-center justify-between">
                                  <Chip
                                    className="border-none pl-0"
                                    color="success"
                                    variant="soft"
                                  >
                                    <Chip.Label>Active</Chip.Label>
                                  </Chip>
                                  <div className="flex items-center gap-3 text-xs text-muted">
                                    <div className="flex items-center gap-1">
                                      <Icon
                                        icon="hugeicons:user-group"
                                        width={14}
                                      />
                                      <span>
                                        {project?.members?.length || 1}
                                      </span>
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
                            </Card.Content>
                          </Card>

                          {/* Additional Info Preview */}
                          <div className="mt-8 p-4 rounded-xl border border-default bg-background/60 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon
                                className="text-muted"
                                icon="hugeicons:settings-01"
                              />
                              <span className="text-sm font-medium">
                                Configuration
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted">
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
                                  <span className="font-mono">
                                    {safeColorHex}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
