import { Divider } from "@heroui/react";

import GetUserDetails from "@/lib/fetch/user/getDetails";
import AdminGetFlows from "@/lib/fetch/admin/flows";
import AdminGetProjects from "@/lib/fetch/admin/projects";
import AdminFlowsHeading from "@/components/admin/flows/heading";
import AdminGetRunners from "@/lib/fetch/admin/runners";
import { AdminFlowsList } from "@/components/admin/flows/list";
import AdminGetFolders from "@/lib/fetch/admin/folders";

export default async function AdminFlowsPage() {
  const flowsData = await AdminGetFlows();
  const foldersData = await AdminGetFolders();
  const projectsData = await AdminGetProjects();
  const userDetailsData = GetUserDetails();
  const runnersData = await AdminGetRunners();

  const [flows, folders, projects, runners, userDetails] = await Promise.all([
    flowsData,
    foldersData,
    projectsData,
    runnersData,
    userDetailsData,
  ]);

  return (
    <main>
      {projects.success &&
        folders.success &&
        flows.success &&
        userDetails.success &&
        runners.success && (
          <>
            <AdminFlowsHeading
              folders={folders.data.folders}
              projects={projects.data.projects}
            />
            <Divider className="mt-4 mb-4" />
            <AdminFlowsList
              flows={flows.data.flows}
              folders={folders.data.folders}
              projects={projects.data.projects}
              runners={runners.data.runners}
            />
          </>
        )}
    </main>
  );
}
