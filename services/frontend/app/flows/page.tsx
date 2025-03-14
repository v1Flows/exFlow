import { Divider, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import FlowList from "@/components/flows/list";
import GetFlows from "@/lib/fetch/flow/all";
import GetFolders from "@/lib/fetch/folder/all";

export default async function FlowsPage() {
  const flowsData = await GetFlows();
  const foldersData = await GetFolders();

  const [flows, folders] = await Promise.all([flowsData, foldersData]);

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Flows</p>
        <div className="flex flex-cols justify-end gap-2">
          <Button isIconOnly variant="ghost">
            <Icon icon="line-md:filter" width={16} />
          </Button>

          <Divider className="h-10 mr-2 ml-2" orientation="vertical" />

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
      <FlowList
        flows={flows.success ? flows.data.flows : []}
        folders={folders.success ? folders.data.folders : []}
      />
    </main>
  );
}
