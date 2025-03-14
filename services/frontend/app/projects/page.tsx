import { Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function ProjectsPage() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Projects</p>
        <div className="flex flex-cols justify-end gap-2">
          <Button isIconOnly variant="ghost">
            <Icon icon="line-md:filter" width={16} />
          </Button>

          <Divider className="h-10 mr-2 ml-2" orientation="vertical" />

          <Button
            color="primary"
            startContent={<Icon icon="solar:book-2-outline" width={16} />}
          >
            Create Project
          </Button>
        </div>
      </div>
      <Divider className="mt-4 mb-4" />
    </main>
  );
}
