"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon, listIcons, loadIcons } from "@iconify/react";
import {
  addToast,
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import tinycolor from "tinycolor2";

import UpdateProject from "@/lib/fetch/project/PUT/UpdateProject";
import ErrorCard from "@/components/error/ErrorCard";
import "react-color-palette/css";

export default function EditProjectModal({
  disclosure,
  project,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;
  const [icons, setIcons] = React.useState<string[]>([]);

  const [color, setColor] = useColor("");

  const [errors] = React.useState({});
  const [apiError, setApiError] = React.useState(false);
  const [apiErrorText, setApiErrorText] = React.useState("");
  const [apiErrorMessage, setApiErrorMessage] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (project === undefined) return;

    loadAllHugeIcons();
    const colorObj = tinycolor(project.color);

    setColor({
      hex: colorObj.toHexString(),
      rgb: colorObj.toRgb(),
      hsv: colorObj.toHsv(),
    });
  }, [disclosure.isOpen]);

  async function loadAllHugeIcons() {
    await loadIcons(["hugeicons:home-01", "hugeicons:ai-folder-02"]);
    setIcons(() => listIcons("", "hugeicons"));
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await UpdateProject(
      project.id,
      data.name.toString(),
      data.description.toString(),
      data.sharedRunners === "true" ? true : false,
      data.projectIcon?.toString(),
      color.hex,
      project.enable_auto_runners,
      project.disable_runner_join,
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "An error occurred while updating the project",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      router.refresh();
      onOpenChange();
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        size="xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Edit Project</p>
                  <p className="text-sm text-default-500">
                    Edit the project details below and click Save Changes to
                    save.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {apiError && (
                  <ErrorCard error={apiErrorText} message={apiErrorMessage} />
                )}
                <Form
                  className="w-full items-stretch"
                  validationErrors={errors}
                  onSubmit={onSubmit}
                >
                  <div className="flex flex-col gap-4">
                    <Input
                      isRequired
                      defaultValue={project.name}
                      label="Name"
                      name="name"
                      placeholder="Enter the project name"
                      variant="flat"
                    />
                    <Input
                      isRequired
                      defaultValue={project.description}
                      label="Description"
                      name="description"
                      placeholder="Enter the project description"
                      variant="flat"
                    />

                    <Select
                      isRequired
                      defaultSelectedKeys={[project.shared_runners.toString()]}
                      description="Shared runners will be used across the platform for all projects."
                      label="Shared Runners"
                      name="sharedRunners"
                      placeholder="Select an option"
                      variant="flat"
                    >
                      <SelectItem key="true" color="success" variant="flat">
                        Enabled
                      </SelectItem>
                      <SelectItem key="false" color="danger" variant="flat">
                        Disabled
                      </SelectItem>
                    </Select>

                    <Select
                      defaultSelectedKeys={[project.icon]}
                      items={icons.map((icon) => ({ textValue: icon }))}
                      label="Icon"
                      name="projectIcon"
                      placeholder="Select an icon"
                      size="md"
                      startContent={<Icon icon={project.icon} width={22} />}
                    >
                      {(item) => (
                        <SelectItem
                          key={item.textValue}
                          textValue={item.textValue}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              className="shrink-0"
                              color="primary"
                              icon={<Icon icon={item.textValue} width={22} />}
                              size="sm"
                            />
                            <div className="flex flex-col">
                              <span className="text-small">
                                {item.textValue}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      )}
                    </Select>

                    <div>
                      <p className="font-bold text-md">Project Color</p>
                      <p className="text-tiny text-default-500">
                        This color appears on the project list and page.
                      </p>
                    </div>
                    <ColorPicker hideInput color={color} onChange={setColor} />
                  </div>

                  <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                    <Button
                      color="default"
                      startContent={
                        <Icon icon="hugeicons:cancel-01" width={18} />
                      }
                      type="reset"
                      variant="ghost"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="warning"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:floppy-disk" width={18} />
                      }
                      type="submit"
                      variant="solid"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
