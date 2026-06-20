"use client";
import { Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
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
  const createFolderModal = useOverlayState();
  const createFlowModal = useOverlayState();
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold mb-1">
          Your <span className="text-accent">Flows</span>
        </p>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button variant="secondary" onPress={createFolderModal.open}>
              {<Icon icon="hugeicons:folder-01" width={16} />}
              Create Folder
            </Button>
            <Button
              isDisabled={!settings.create_flows && user.role !== "admin"}
              onPress={createFlowModal.open}
              variant="primary"
            >
              {<Icon icon="hugeicons:workflow-square-10" width={16} />}
              Create Flow
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button
              variant="secondary"
              onPress={createFolderModal.open}
              className="aspect-square p-0"
            >
              <Icon icon="hugeicons:folder-01" width={16} />
            </Button>
            <Button
              onPress={createFlowModal.open}
              variant="primary"
              className="aspect-square p-0"
            >
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
