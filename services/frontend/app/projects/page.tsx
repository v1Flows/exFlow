import { Divider } from "@heroui/react";

import ErrorCard from "@/components/error/ErrorCard";
import { ProjectsList } from "@/components/projects/list";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetProjects from "@/lib/fetch/project/all";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import ProjectsHeading from "@/components/projects/heading";

export default async function ProjectsPage() {
  const projectsData = GetProjects();
  const settingsData = PageGetSettings();
  const userDetailsData = GetUserDetails();

  const [projects, settings, userDetails] = (await Promise.all([
    projectsData,
    settingsData,
    userDetailsData,
  ])) as any;

  return (
    <main>
      {projects.success && settings.success && userDetails.success ? (
        <>
          <ProjectsHeading
            settings={settings.data.settings}
            userDetails={userDetails.data.user}
          />
          <Divider className="mt-4 mb-4" />
          <ProjectsList
            pending_projects={projects.data.pending_projects}
            projects={projects.data.projects}
            settings={settings.data.settings}
            user={userDetails.data.user}
          />
        </>
      ) : (
        <ErrorCard
          error={projects.error || settings.error || userDetails.error}
          message={projects.message || settings.message || userDetails.message}
        />
      )}
    </main>
  );
}
