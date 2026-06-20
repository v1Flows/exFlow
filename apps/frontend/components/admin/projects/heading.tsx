"use client";
import { Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import CreateProjectModal from "@/components/modals/projects/create";
export default function AdminProjectsHeading() {
  const newProjectModal = useOverlayState();
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | Projects
          </p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button onPress={newProjectModal.open} variant="primary">
              {<Icon icon="hugeicons:ai-folder-01" width={16} />}
              Create Project
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button variant="primary" className="aspect-square p-0">
              <Icon icon="hugeicons:ai-folder-01" width={16} />
            </Button>
          </div>
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
    </main>
  );
}
