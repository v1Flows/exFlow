import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";

import FlowList from "@/components/dashboard/flows/list";

export default function AboutPage() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Flows</p>
        <div className="flex flex-cols justify-end gap-2">
          <Button
            color="primary"
            startContent={<Icon icon="solar:book-2-outline" width={16} />}
          >
            Create Flow
          </Button>
          <Button
            color="primary"
            startContent={
              <Icon icon="solar:folder-with-files-outline" width={16} />
            }
            variant="flat"
          >
            Create Folder
          </Button>
        </div>
      </div>
      <Divider className="mt-4 mb-4" />
      <FlowList />
    </main>
  );
}
