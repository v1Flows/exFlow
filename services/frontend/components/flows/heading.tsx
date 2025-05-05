"use client";

import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Divider,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "next/navigation";

import CreateFolderModal from "../modals/folders/create";
import CreateFlowModal from "../modals/flows/create";

export default function FlowsHeading({
  projects,
  folders,
}: {
  projects: any;
  folders: any;
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
          <Button isIconOnly variant="ghost">
            <Icon icon="line-md:filter" width={16} />
          </Button>

          <Divider className="h-10 mr-2 ml-2" orientation="vertical" />

          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={
                <Icon icon="hugeicons:workflow-square-10" width={16} />
              }
              onPress={createFlowModal.onOpen}
            >
              Create Flow
            </Button>
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:folder-01" width={16} />}
              variant="flat"
              onPress={createFolderModal.onOpen}
            >
              Create Folder
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button isIconOnly color="primary" onPress={createFlowModal.onOpen}>
              <Icon icon="solar:book-2-outline" width={16} />
            </Button>
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={createFolderModal.onOpen}
            >
              <Icon icon="solar:folder-with-files-outline" width={16} />
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
