import ErrorCard from "@/components/error/ErrorCard";
import GetFlows from "@/lib/fetch/flow/all";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetProjectAuditLogs from "@/lib/fetch/project/audit";
import GetProject from "@/lib/fetch/project/data";
import GetProjectRunners from "@/lib/fetch/project/runners";
import GetProjectApiKeys from "@/lib/fetch/project/tokens";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import Project from "@/components/projects/project";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const settingsData = PageGetSettings();
  const projectData = GetProject(id);
  const runnersData = GetProjectRunners(id);
  const tokensData = GetProjectApiKeys(id);
  const auditData = GetProjectAuditLogs(id);
  const userDetailsData = GetUserDetails();
  const flowsData = GetFlows();

  const [settings, project, runners, tokens, audit, userDetails, flows] =
    (await Promise.all([
      settingsData,
      projectData,
      runnersData,
      tokensData,
      auditData,
      userDetailsData,
      flowsData,
    ])) as any;

  return (
    <>
      {audit.success &&
      flows.success &&
      project.success &&
      runners.success &&
      settings.success &&
      tokens.success &&
      userDetails.success ? (
        <Project
          audit={audit.data.audit}
          flows={flows.data.flows}
          members={project.data.members}
          project={project.data.project}
          runners={runners.data.runners}
          settings={settings.data.settings}
          tokens={tokens.data.tokens}
          user={userDetails.data.user}
        />
      ) : (
        <ErrorCard
          error={
            audit.error ||
            flows.error ||
            project.error ||
            runners.error ||
            settings.error ||
            tokens.error ||
            userDetails.error
          }
          message={
            audit.message ||
            flows.message ||
            project.message ||
            runners.message ||
            settings.message ||
            tokens.message ||
            userDetails.message
          }
        />
      )}
    </>
  );
}
