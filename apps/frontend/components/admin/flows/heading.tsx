"use client";
import { Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import CreateFolderModal from "../../modals/folders/create";
import CreateFlowModal from "../../modals/flows/create";
export default function AdminFlowsHeading({
  projects,
  folders,
}: {
  projects: any;
  folders: any;
}) {
  const createFolderModal = useOverlayState();
  const createFlowModal = useOverlayState();
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | Flows
          </p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button onPress={createFlowModal.open} variant="primary">
              {<Icon icon="hugeicons:workflow-square-10" width={16} />}
              Create Flow
            </Button>
            <Button variant="secondary" onPress={createFolderModal.open}>
              {<Icon icon="hugeicons:folder-01" width={16} />}
              Create Folder
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button
              onPress={createFlowModal.open}
              variant="primary"
              className="aspect-square p-0"
            >
              <Icon icon="hugeicons:workflow-square-10" width={16} />
            </Button>
            <Button
              variant="secondary"
              onPress={createFolderModal.open}
              className="aspect-square p-0"
            >
              <Icon icon="hugeicons:folder-01" width={16} />
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
