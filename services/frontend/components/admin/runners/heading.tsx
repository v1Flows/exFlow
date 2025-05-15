"use client";

import { addToast, Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import CreateProjectModal from "@/components/modals/projects/create";
import Reloader from "@/components/reloader/Reloader";

export default function AdminRunnersHeading({ settings }: any) {
  const newProjectModal = useDisclosure();

  const copyToken = () => {
    navigator.clipboard.writeText(settings.shared_runner_auto_join_token);
    addToast({
      title: "Shared Runner Token Copied",
      description: "Shared Runner Token copied to clipboard!",
      color: "success",
      variant: "flat",
    });
  };

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">Runners</p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:key-02" width={18} />}
              variant="flat"
              onPress={copyToken}
            >
              Copy Shared Runner Token
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button isIconOnly color="primary">
              <Icon icon="hugeicons:ai-brain-04" width={18} />
            </Button>
          </div>

          <Reloader circle refresh={10} />
        </div>
      </div>
      <CreateProjectModal disclosure={newProjectModal} />
    </main>
  );
}
