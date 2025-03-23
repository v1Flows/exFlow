"use client";

import { Button, Divider, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

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

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Flows</p>
        <div className="flex flex-cols justify-end gap-2">
          <Button isIconOnly variant="ghost">
            <Icon icon="line-md:filter" width={16} />
          </Button>

          <Divider className="h-10 mr-2 ml-2" orientation="vertical" />

          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="solar:book-2-outline" width={16} />}
              onPress={createFlowModal.onOpen}
            >
              Create Flow
            </Button>
            <Button
              color="primary"
              startContent={
                <Icon icon="solar:folder-with-files-outline" width={16} />
              }
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
