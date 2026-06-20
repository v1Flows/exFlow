"use client";
import { Button, toast, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import CreateProjectModal from "@/components/modals/projects/create";
import RotateSharedAutoJoinTokenModal from "@/components/modals/admin/rotateSharedAutoJoinToken";
export default function AdminRunnersHeading({ settings }: any) {
  const newProjectModal = useOverlayState();
  const rotateSharedAutoJoinTokenModal = useOverlayState();
  const copyToken = () => {
    navigator.clipboard.writeText(settings.shared_runner_auto_join_token);
    toast.success("Shared Runner Token Copied", {
      description: "Shared Runner Token copied to clipboard!",
    });
  };
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | Runners
          </p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button variant="secondary" onPress={copyToken}>
              {<Icon icon="hugeicons:key-02" width={18} />}
              Copy Shared Runner Token
            </Button>
            <Button
              variant="tertiary"
              onPress={rotateSharedAutoJoinTokenModal.open}
            >
              {<Icon icon="hugeicons:rotate-clockwise" width={18} />}
              Rotate Shared Runner Token
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button
              variant="secondary"
              onPress={copyToken}
              className="aspect-square p-0"
            >
              <Icon icon="hugeicons:key-02" width={18} />
            </Button>
          </div>
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
      <RotateSharedAutoJoinTokenModal
        disclosure={rotateSharedAutoJoinTokenModal}
      />
    </main>
  );
}
