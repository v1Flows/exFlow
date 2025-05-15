import { Divider } from "@heroui/react";

import RunnersList from "@/components/runners/list";
import GetRunners from "@/lib/fetch/runner/get";
import GetProjects from "@/lib/fetch/project/all";
import RunnersHeading from "@/components/runners/heading";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import ErrorCard from "@/components/error/ErrorCard";

export default async function RunnersPage() {
  const projectsData = GetProjects();
  const runnersData = GetRunners();
  const userDetailsData = GetUserDetails();

  const [projects, runners, userDetails] = (await Promise.all([
    projectsData,
    runnersData,
    userDetailsData,
  ])) as any;

  return (
    <main>
      {projects.success && runners.success && userDetails.success ? (
        <>
          <RunnersHeading />
          <Divider className="mt-4 mb-4" />

          <RunnersList
            globalView
            projects={projects.data.projects}
            runners={runners.data.runners}
            user={userDetails.data.user}
          />
        </>
      ) : (
        <ErrorCard
          error={projects.error || runners.error || userDetails.error}
          message={projects.message || runners.message || userDetails.message}
        />
      )}
    </main>
  );
}
