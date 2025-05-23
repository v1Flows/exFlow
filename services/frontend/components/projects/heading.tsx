"use client";

import { Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import CreateProjectModal from "../modals/projects/create";

export default function ProjectsHeading({ settings, user }: any) {
  const newProjectModal = useDisclosure();

  function createButtonIsDisabled() {
    if (!settings.create_projects && user.role !== "admin") {
      return true;
    }

    return false;
  }

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Projects</p>
        <div className="flex flex-cols justify-end gap-2">
          <Button
            className="hidden sm:flex gap-2"
            color="primary"
            isDisabled={createButtonIsDisabled()}
            startContent={<Icon icon="hugeicons:plus-sign" width={16} />}
            onPress={() => newProjectModal.onOpen()}
          >
            Create Project
          </Button>

          {/* Mobile */}
          <Button
            isIconOnly
            className="sm:hidden flex gap-2"
            color="primary"
            isDisabled={createButtonIsDisabled()}
            startContent={<Icon icon="hugeicons:plus-sign" width={16} />}
            onPress={() => newProjectModal.onOpen()}
          />
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
    </main>
  );
}
