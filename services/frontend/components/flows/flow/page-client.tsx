"use client";

import { motion } from "framer-motion";

import FlowTabs from "@/components/flows/flow/tabs";
import ErrorCard from "@/components/error/ErrorCard";
import FlowHeading from "@/components/flows/flow/heading";
import FlowDetails from "@/components/flows/flow/details";
import FlowPageSkeleton from "@/components/flows/flow/page-skeleton";
import {
  useFlow,
  useFlows,
  useProjects,
  useUserDetails,
  useFolders,
  usePageSettings,
  useProjectRunners,
  useProject,
} from "@/lib/swr/hooks/flows";

interface FlowPageClientProps {
  flowId: string;
}

export default function FlowPageClient({ flowId }: FlowPageClientProps) {
  // Fetch all data using SWR hooks
  const { flow, isLoading: flowLoading, isError: flowError } = useFlow(flowId);
  const { flows } = useFlows();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { user, isLoading: userLoading } = useUserDetails();
  const { folders, isLoading: foldersLoading } = useFolders();
  const { settings, isLoading: settingsLoading } = usePageSettings();

  // Only fetch project-specific data if we have the flow
  const { runners, isLoading: runnersLoading } = useProjectRunners(
    (flow as any)?.project_id || "",
  );
  const { project, isLoading: projectLoading } = useProject(
    (flow as any)?.project_id || "",
  );

  // Check if any essential data is still loading or missing
  const isLoading =
    flowLoading ||
    userLoading ||
    settingsLoading ||
    projectsLoading ||
    foldersLoading ||
    !user ||
    !settings ||
    !projects ||
    !folders;
  const isProjectDataLoading = flow && (runnersLoading || projectLoading);

  // Show loading state if essential data is still loading
  if (isLoading || isProjectDataLoading) {
    return <FlowPageSkeleton />;
  }

  // Show error state
  if (flowError || !flow) {
    return (
      <main>
        <ErrorCard
          error="Flow not found"
          message="The requested flow could not be loaded."
        />
      </main>
    );
  }

  return (
    <motion.main
      animate="visible"
      className="w-full p-4 space-y-8"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <FlowHeading
        flow={flow}
        folders={folders}
        project={project}
        projects={projects}
        settings={settings}
        user={user}
      />
      <FlowDetails flow={flow} project={project} runners={runners} />
      <FlowTabs
        flow={flow}
        flows={flows}
        members={(project as any)?.members || []}
        projects={projects}
        runners={runners}
        settings={settings}
        user={user}
      />
    </motion.main>
  );
}
