import { Divider } from "@heroui/react";

import ErrorCard from "@/components/error/ErrorCard";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import AdminGetProjects from "@/lib/fetch/admin/projects";
import AdminGetPageSettings from "@/lib/fetch/admin/settings";
import AdminProjectsHeading from "@/components/admin/projects/heading";
import { AdminProjectList } from "@/components/admin/projects/list";

export default async function AdminProjectsPage() {
  const projectsData = AdminGetProjects();
  const settingsData = AdminGetPageSettings();
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
          <AdminProjectsHeading />
          <Divider className="mt-4 mb-4" />
          <AdminProjectList
            members={projects.data.members}
            projects={projects.data.projects}
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
