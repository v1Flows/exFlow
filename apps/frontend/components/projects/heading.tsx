"use client";
import { Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import CreateProjectModal from "../modals/projects/create";
export default function ProjectsHeading({ settings, user }: any) {
  const newProjectModal = useOverlayState();
  function createButtonIsDisabled() {
    if (!settings.create_projects && user.role !== "admin") {
      return true;
    }
    return false;
  }
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">
          Your <span className="text-accent">Projects</span>
        </p>
        <div className="flex flex-cols justify-end gap-2">
          <Button
            className="hidden sm:flex gap-2"
            isDisabled={createButtonIsDisabled()}
            onPress={() => newProjectModal.open()}
            variant="primary"
          >
            {<Icon icon="hugeicons:plus-sign" width={16} />}
            Create Project
          </Button>

          {/* Mobile */}
          <Button
            className="sm:hidden flex gap-2"
            isDisabled={createButtonIsDisabled()}
            onPress={() => newProjectModal.open()}
            variant="primary"
          >
            {<Icon icon="hugeicons:plus-sign" width={16} />}
          </Button>
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
    </main>
  );
}
