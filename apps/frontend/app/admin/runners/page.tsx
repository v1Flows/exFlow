import { Divider } from "@heroui/react";

import AdminRunnersHeading from "@/components/admin/runners/heading";
import RunnersList from "@/components/runners/list";
import AdminGetProjects from "@/lib/fetch/admin/projects";
import AdminGetRunners from "@/lib/fetch/admin/runners";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import AdminGetPageSettings from "@/lib/fetch/admin/settings";

export default async function AdminRunnersPage() {
  const projectsData = AdminGetProjects();
  const runnersData = AdminGetRunners();
  const userDetailsData = GetUserDetails();
  const settingsData = AdminGetPageSettings();

  const [projects, runners, userDetails, settings] = (await Promise.all([
    projectsData,
    runnersData,
    userDetailsData,
    settingsData,
  ])) as any;

  return (
    <main>
      <AdminRunnersHeading settings={settings.data.settings} />
      <Divider className="mt-4 mb-4" />
      {projects.success && runners.success && userDetails.success && (
        <RunnersList
          globalView
          projects={projects.data.projects}
          runners={runners.data.runners}
          user={userDetails.data.user}
        />
      )}
    </main>
  );
}
