"use client";

import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "next/navigation";

import CreateFolderModal from "../modals/folders/create";
import CreateFlowModal from "../modals/flows/create";

export default function FlowsHeading({
  projects,
  folders,
  settings,
  user,
}: {
  projects: any;
  folders: any;
  settings: any;
  user: any;
}) {
  const createFolderModal = useDisclosure();
  const createFlowModal = useDisclosure();

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">Flows</p>
          {searchFolderID && (
            <Breadcrumbs variant="solid">
              <BreadcrumbItem
                href="/flows"
                startContent={
                  <Icon icon="hugeicons:workflow-square-10" width={16} />
                }
              >
                Flows
              </BreadcrumbItem>
              <BreadcrumbItem
                startContent={<Icon icon="hugeicons:folder-01" width={16} />}
              >
                {folders.find((f: any) => f.id === searchFolderID)?.name}
              </BreadcrumbItem>
            </Breadcrumbs>
          )}
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:folder-01" width={16} />}
              variant="flat"
              onPress={createFolderModal.onOpen}
            >
              Create Folder
            </Button>
            <Button
              color="primary"
              isDisabled={!settings.create_flows && user.role !== "admin"}
              startContent={
                <Icon icon="hugeicons:workflow-square-10" width={16} />
              }
              onPress={createFlowModal.onOpen}
            >
              Create Flow
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={createFolderModal.onOpen}
            >
              <Icon icon="hugeicons:folder-01" width={16} />
            </Button>
            <Button isIconOnly color="primary" onPress={createFlowModal.onOpen}>
              <Icon icon="hugeicons:workflow-square-10" width={16} />
            </Button>
          </div>
        </div>
      </div>
      <CreateFolderModal
        disclosure={createFolderModal}
        folders={folders}
        projects={projects}
      />
      <CreateFlowModal
        disclosure={createFlowModal}
        folders={folders}
        projects={projects}
      />
    </main>
  );
}
