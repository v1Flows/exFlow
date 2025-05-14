"use client";

import { Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import CreateProjectModal from "@/components/modals/projects/create";

export default function AdminProjectsHeading() {
  const newProjectModal = useDisclosure();

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">Projects</p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:ai-folder-01" width={16} />}
              onPress={newProjectModal.onOpen}
            >
              Create Project
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button isIconOnly color="primary">
              <Icon icon="hugeicons:ai-folder-01" width={16} />
            </Button>
          </div>
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
    </main>
  );
}
