"use client";

import {
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  DropdownTrigger,
  useDisclosure,
  CardHeader,
  CardFooter,
  Chip,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import APIStartExecution from "@/lib/fetch/executions/start";

import DeleteFolderModal from "../modals/folders/delete";
import UpdateFolderModal from "../modals/folders/update";

export default function FlowList({
  flows,
  folders,
  projects,
}: {
  flows: any;
  folders: any;
  projects: any;
}) {
  const router = useRouter();

  const [filteredFolders, setFilteredFolders] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);
  const [targetFolder, setTargetFolder] = useState({});

  const updateFolderModal = useDisclosure();
  const deleteFolderModal = useDisclosure();

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  useEffect(() => {
    if (searchFolderID) {
      setFilteredFolders(
        folders.filter((f: any) => f.parent_id === searchFolderID),
      );
      setFilteredFlows(
        flows.filter((f: any) => f.folder_id === searchFolderID),
      );
    } else {
      setFilteredFolders(folders.filter((f: any) => f.parent_id === ""));
      setFilteredFlows(flows.filter((f: any) => f.folder_id === ""));
    }
  }, [searchFolderID]);

  return (
    <main>
      <p className="text-md font-bold text-default-500 mb-2">
        Folders{" "}
        {searchFolderID && (
          <span className="text-primary font-bold">
            | Current: {folders.find((f: any) => f.id === searchFolderID)?.name}
          </span>
        )}
      </p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {searchFolderID && (
          <Card
            fullWidth
            isPressable
            className="bg-default-200 bg-opacity-10 border-2 border-default p-3"
            onPress={() => router.back()}
          >
            <CardBody className="flex flex-col items-center justify-center gap-2">
              <Icon className="text-3xl" icon="hugeicons:link-backward" />
              <p>Back</p>
            </CardBody>
          </Card>
        )}
        {filteredFolders.map((f: any) => (
          <Card
            key={f.id}
            fullWidth
            isPressable
            className="bg-primary bg-opacity-10 border-2 border-primary pb-3"
            onPress={() => router.push("/flows?folder=" + f.id)}
          >
            <CardBody>
              <div className="flex items-start justify-end">
                <Dropdown backdrop="opaque">
                  <DropdownTrigger>
                    <Icon
                      className="m-1 hover:text-primary"
                      icon="solar:menu-dots-bold"
                      width={24}
                    />
                  </DropdownTrigger>
                  <DropdownMenu variant="flat">
                    <DropdownSection title="Actions">
                      <DropdownItem
                        key="edit"
                        showDivider
                        color="warning"
                        startContent={
                          <Icon icon="hugeicons:pencil-edit-02" width={18} />
                        }
                        onPress={() => {
                          setTargetFolder(f);
                          updateFolderModal.onOpen();
                        }}
                      >
                        Edit
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Danger Zone">
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={
                          <Icon icon="hugeicons:delete-02" width={18} />
                        }
                        onPress={() => {
                          setTargetFolder(f);
                          deleteFolderModal.onOpen();
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <Icon className="text-3xl" icon="hugeicons:folder-01" />
                <div className="text-center">
                  <p className="font-bold">{f.name}</p>
                  <p className="text-tiny text-default-500">{f.description}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {folders.length === 0 && (
          <p className="text-default-500 text-center col-span-4">
            No folders found
          </p>
        )}
      </div>

      <p className="text-md font-bold text-default-500 mb-2">
        Flows <span className="text-tiny">(in current folder)</span>
      </p>

      <div className="flex flex-col gap-4">
        {/* Running Flow Card */}
        {filteredFlows.length === 0 && (
          <p className="text-default-500 text-center">No flows found</p>
        )}
        {filteredFlows.map((flow: any) => {
          const project = projects.find((p: any) => p.id === flow.project_id);

          return (
            <Card
              key={flow.id}
              fullWidth
              isPressable
              className="bg-default-500 bg-opacity-10 border-2 border-default"
              onPress={() => router.push("/flows/" + flow.id)}
            >
              <CardHeader className="flex flex-cols items-center justify-between">
                <div className="flex flex-col items-start">
                  <p className="font-bold text-lg">{flow.name}</p>
                  <p className="text-sm text-default-500">{flow.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button isIconOnly color="warning" variant="flat">
                    <Icon icon="hugeicons:calendar-02" width={16} />
                  </Button>
                  <Button
                    isIconOnly
                    color="success"
                    variant="flat"
                    onPress={() => {
                      APIStartExecution(flow.id)
                        .then(() => {
                          addToast({
                            title: "Execution Started",
                            color: "success",
                          });
                        })
                        .catch((err) => {
                          addToast({
                            title: "Execution start failed",
                            description: err.message,
                            color: "danger",
                          });
                        });
                    }}
                  >
                    <Icon icon="solar:play-linear" />
                  </Button>
                </div>
              </CardHeader>
              <CardFooter className="flex flex-cols items-center justify-between">
                <div className="flex flex-cols items-center gap-1">
                  <Icon
                    icon={
                      project.icon
                        ? project.icon
                        : "solar:question-square-outline"
                    }
                    style={{ color: project?.color }}
                    width={22}
                  />
                  <p>{project?.name}</p>
                </div>
                <div className="flex items-center">
                  <Button isIconOnly color="warning" variant="light">
                    <Icon icon="hugeicons:pencil-edit-02" width={20} />
                  </Button>
                  <Chip
                    color={project.disabled ? "danger" : "success"}
                    radius="sm"
                    size="md"
                    variant="light"
                  >
                    <p className="font-bold">
                      {project.disabled ? "Disabled" : "Active"}
                    </p>
                  </Chip>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <UpdateFolderModal
        disclosure={updateFolderModal}
        folder={targetFolder}
        folders={folders}
        projects={projects}
      />
      <DeleteFolderModal disclosure={deleteFolderModal} folder={targetFolder} />
    </main>
  );
}
