"use client";

import {
  Card,
  CardBody,
  Dropdown,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  DropdownTrigger,
  useDisclosure,
  CardHeader,
  CardFooter,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import DeleteFolderModal from "../modals/folders/delete";
import UpdateFolderModal from "../modals/folders/update";
import ScheduleExecutionModal from "../modals/executions/schedule";

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
  const [targetFlow, setTargetFlow] = useState({});

  const scheduleExecutionModal = useDisclosure();
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
  }, [searchFolderID, folders, flows]);

  return (
    <main>
      <p className="text-lg font-bold mb-2">Folders</p>
      <div className="grid lg:grid-cols-4 grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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
            className="bg-default bg-opacity-20 border-2 border-default pb-3"
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

      <p className="text-lg font-bold mb-2">
        Flows <span className="text-tiny">(in current folder)</span>
      </p>

      {filteredFlows.length === 0 && (
        <p className="text-default-500 text-center">No flows found</p>
      )}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {filteredFlows.map((flow: any) => {
          const project = projects.find((p: any) => p.id === flow.project_id);

          return (
            <Card
              key={flow.id}
              fullWidth
              isPressable
              className="bg-default-200 bg-opacity-20 border-2 border-primary"
              onPress={() => router.push("/flows/" + flow.id)}
            >
              <CardHeader className="flex flex-cols items-center justify-between">
                <div className="flex flex-col items-start">
                  <p className="font-bold text-lg">{flow.name}</p>
                  <p className="text-sm text-default-500">{flow.description}</p>
                </div>
              </CardHeader>
              <CardFooter className="flex flex-cols items-center justify-between">
                <Chip
                  startContent={
                    <Icon
                      icon={
                        project.icon
                          ? project.icon
                          : "solar:question-square-outline"
                      }
                      style={{ color: project?.color }}
                      width={18}
                    />
                  }
                  variant="bordered"
                >
                  {project.name || "Unknown"}
                </Chip>
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
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <ScheduleExecutionModal
        disclosure={scheduleExecutionModal}
        flow={targetFlow}
      />
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
