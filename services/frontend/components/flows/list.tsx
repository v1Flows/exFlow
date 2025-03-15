"use client";

import {
  Card,
  CardBody,
  Button,
  CircularProgress,
  Dropdown,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  DropdownTrigger,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlowList({
  flows,
  folders,
}: {
  flows: any;
  folders: any;
}) {
  const router = useRouter();

  const [filteredFolders, setFilteredFolders] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);

  const [targetFolder, setTargetFolder] = useState(null);

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
        {filteredFolders.map((folder: any) => (
          <Card
            key={folder.id}
            fullWidth
            isPressable
            className="bg-primary bg-opacity-10 border-2 border-primary pb-3"
            onPress={() => router.push("/flows?folder=" + folder.id)}
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
                          setTargetFolder(folder);
                          // editProjectModal.onOpen();
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
                          setTargetFolder(folder);
                          // deleteProjectModal.onOpen();
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
                <p>{folder.name}</p>
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
        {filteredFlows.map((flow: any) => (
          <Card
            key={flow.id}
            fullWidth
            isPressable
            onPress={() => router.push("/flows/" + flow.id)}
          >
            <CardBody className="grid grid-cols-7 items-center justify-center gap-4">
              <div className="flex items-center justify-center">
                <CircularProgress aria-label="Loading..." size="lg" />
              </div>
              <div className="text-center">
                <p>{flow.name}</p>
                <p className="text-sm text-default-500">{flow.description}</p>
              </div>
              <div className="text-center">
                <p>-</p>
                <p className="text-sm text-default-500">Duration</p>
              </div>
              <div className="text-center">
                <p>-</p>
                <p className="text-sm text-default-500">Total Executions</p>
              </div>
              <div className="text-center">
                <p>-</p>
                <p className="text-sm text-default-500">Last Failed</p>
              </div>
              <div className="text-center">
                <p>-</p>
                <p className="text-sm text-default-500">Last Success</p>
              </div>
              <Button
                isDisabled
                isIconOnly
                className="justify-self-center"
                color="success"
                variant="flat"
              >
                <Icon icon="solar:play-linear" />
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
