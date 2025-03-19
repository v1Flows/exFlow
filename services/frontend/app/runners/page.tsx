import { Divider } from "@heroui/react";

import RunnersList from "@/components/runners/list";
import GetRunners from "@/lib/fetch/runner/get";
import GetProjects from "@/lib/fetch/project/all";
import RunnersHeading from "@/components/runners/heading";

export default async function RunnersPage() {
  const projectsData = GetProjects();
  const runnersData = GetRunners();

  const [projects, runners] = (await Promise.all([
    projectsData,
    runnersData,
  ])) as any;

  return (
    <main>
      <RunnersHeading />
      <Divider className="mt-4 mb-4" />
      <RunnersList
        projects={projects.data.projects}
        runners={runners.data.runners}
      />
    </main>
  );
}
