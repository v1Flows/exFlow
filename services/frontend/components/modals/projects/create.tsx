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

import CreateProject from "@/lib/fetch/project/POST/CreateProject";
import ErrorCard from "@/components/error/ErrorCard";
import "react-color-palette/css";

export default function CreateProjectModal({
  disclosure,
}: {
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;
  const [icons, setIcons] = React.useState<string[]>([]);

  const [color, setColor] = useColor("#5213d7");

  const [errors, setErrors] = React.useState({});
  const [apiError, setApiError] = React.useState(false);
  const [apiErrorText, setApiErrorText] = React.useState("");
  const [apiErrorMessage, setApiErrorMessage] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    loadAllHugeIcons();
  }, []);

  async function loadAllHugeIcons() {
    await loadIcons(["hugeicons:home-01", "hugeicons:ai-folder-02"]);
    setIcons(() => listIcons("", "hugeicons"));
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await CreateProject(
      data.name.toString(),
      data.description.toString(),
      data.sharedRunners === "true" ? true : false,
      data.projectIcon.toString(),
      color.hex,
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create project");
      setApiErrorMessage("Failed to create project");
      addToast({
        title: "Project",
        description: "Failed to create project",
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
      setErrors({});
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "Failed to create project",
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
        isOpen={isOpen}
        placement="center"
        size="xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {() => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Create new project</p>
                  <p className="text-sm text-default-500">
                    Projects are where you manage team members, create flows or
                    runners.
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
                      label="Name"
                      name="name"
                      placeholder="Enter name"
                      radius="sm"
                      variant="flat"
                    />
                    <Input
                      isRequired
                      label="Description"
                      name="description"
                      placeholder="Enter description"
                      radius="sm"
                      variant="flat"
                    />
                    <Select
                      isRequired
                      defaultSelectedKeys={["true"]}
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
                      defaultSelectedKeys={["hugeicons:package-open"]}
                      items={icons.map((icon) => ({ textValue: icon }))}
                      label="Icon"
                      name="projectIcon"
                      placeholder="Select an icon"
                      size="md"
                      startContent={
                        <Icon icon="hugeicons:package-open" width={22} />
                      }
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
                      variant="flat"
                      onPress={cancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:plus-sign" width={18} />
                      }
                      type="submit"
                    >
                      Create Project
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
