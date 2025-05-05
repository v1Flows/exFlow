import GetFolders from "@/lib/fetch/folder/all";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import AdminGetFlows from "@/lib/fetch/admin/flows";
import AdminGetProjects from "@/lib/fetch/admin/projects";
import AdminGetExecutions from "@/lib/fetch/admin/executions";
import AdminFlowsHeading from "@/components/admin/flows/heading";

export default async function AdminFlowsPage() {
  const flowsData = await AdminGetFlows();
  const foldersData = await GetFolders();
  const projectsData = await AdminGetProjects();
  const runningExecutionsData = await AdminGetExecutions();
  const userDetailsData = GetUserDetails();

  const [flows, folders, projects, runningExecutions, userDetails] =
    await Promise.all([
      flowsData,
      foldersData,
      projectsData,
      runningExecutionsData,
      userDetailsData,
    ]);

  return (
    <main>
      {projects.success &&
        folders.success &&
        flows.success &&
        userDetails.success && (
          <>
            <AdminFlowsHeading
              folders={folders.data.folders}
              projects={projects.data.projects}
            />
          </>
        )}
    </main>
  );
}
