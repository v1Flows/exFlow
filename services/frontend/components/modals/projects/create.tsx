"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon, listIcons, loadIcons } from "@iconify/react";
import {
  addToast,
  Avatar,
  Button,
  ButtonGroup,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { LibraryIcon } from "lucide-react";
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

  // success modal
  const { isOpen: isOpenSuccess, onOpenChange: onOpenChangeSuccess } =
    useDisclosure();

  const [color, setColor] = useColor("#5213d7");
  const [projectIcon, setProjectIcon] = React.useState("hugeicons:home-12");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sharedRunners, setSharedRunners] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    loadAllIcons();
  }, []);

  async function loadAllIcons() {
    await loadIcons(["hugeicons:home-12", "hugeicons:alien-02"]);
    setIcons(() => listIcons("", "hugeicons"));
  }

  const handleIconChange = (e: any) => {
    setProjectIcon(e.target.value);
  };

  async function createProject() {
    setIsLoading(true);

    const res = (await CreateProject(
      name,
      description,
      sharedRunners,
      projectIcon,
      color.hex,
    )) as any;

    if (!res) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to create project");
      setErrorMessage("Failed to create project");
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
      onOpenChangeSuccess();
      setName("");
      setDescription("");
      setSharedRunners(false);
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "Failed to create project",
        color: "danger",
        variant: "flat",
      });
    }
  }

  function cancel() {
    setName("");
    setDescription("");
    setSharedRunners(false);
    setIsLoading(false);
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
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Create new project</p>
                  <p className="text-sm text-default-500">
                    Projects are where you manage team members, create flows or
                    runners.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Name"
                    labelPlacement="outside"
                    placeholder="Enter name"
                    radius="sm"
                    type="name"
                    value={name}
                    variant="flat"
                    onValueChange={setName}
                  />
                  <Input
                    isRequired
                    label="Description"
                    labelPlacement="outside"
                    placeholder="Enter description"
                    radius="sm"
                    type="description"
                    value={description}
                    variant="flat"
                    onValueChange={setDescription}
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex-cols flex items-center gap-2">
                      <p className="text-sm">Shared Runners</p>
                      <Tooltip content="Shared runners will be used across the platform for all projects.">
                        <Icon
                          className="text-default-500"
                          icon="solar:info-circle-linear"
                          width={18}
                        />
                      </Tooltip>
                    </div>
                    <div>
                      <ButtonGroup radius="sm" variant="flat">
                        <Button
                          className={`${sharedRunners ? "bg-primary" : ""}`}
                          onPress={() => setSharedRunners(true)}
                        >
                          <Icon
                            className="text-success"
                            icon="solar:check-circle-linear"
                            width={18}
                          />
                          Enabled
                        </Button>
                        <Button
                          className={`${!sharedRunners ? "bg-primary" : ""}`}
                          onPress={() => setSharedRunners(false)}
                        >
                          <Icon
                            className="text-danger"
                            icon="solar:close-circle-linear"
                            width={18}
                          />
                          Disabled
                        </Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </div>
                <Divider />
                <Select
                  items={icons.map((icon) => ({ textValue: icon }))}
                  label="Icon"
                  labelPlacement="outside"
                  placeholder="Select an icon"
                  selectedKeys={[projectIcon]}
                  size="md"
                  startContent={<Icon icon={projectIcon} width={22} />}
                  onChange={handleIconChange}
                >
                  {(item) => (
                    <SelectItem key={item.textValue} textValue={item.textValue}>
                      <div className="flex items-center gap-2">
                        <Avatar
                          className="shrink-0"
                          color="primary"
                          icon={<Icon icon={item.textValue} width={22} />}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-small">{item.textValue}</span>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </Select>
                <div>
                  <p className="font-bold">Project Color</p>
                  <p className="text-sm text-default-500">
                    This color appears on the project list and page.
                  </p>
                </div>
                <ColorPicker hideInput color={color} onChange={setColor} />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onPress={cancel}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={createProject}
                >
                  Create Project
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Instructions Modal */}

      <Modal
        backdrop="blur"
        isOpen={isOpenSuccess}
        placement="center"
        size="lg"
        onOpenChange={onOpenChangeSuccess}
      >
        <ModalContent className="w-full">
          {(onInstructionsClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1 text-success">
                <Icon icon="solar:verified-check-broken" width={58} />
                <p className="text-xl font-bold">
                  Project successfully created
                </p>
              </ModalHeader>
              <ModalBody className="text-center">
                <p>
                  Your new project has been created successfully and is ready to
                  be used.
                </p>
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button
                  color="default"
                  variant="bordered"
                  onPress={onInstructionsClose}
                >
                  <LibraryIcon />
                  Show Documentation
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={onInstructionsClose}
                >
                  <Icon icon="solar:glasses-line-duotone" width={20} />
                  Start Exploring
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
