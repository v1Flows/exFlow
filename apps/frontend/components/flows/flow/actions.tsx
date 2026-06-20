"use client";

import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";

import FlowCanvas from "@/components/flows/flow/dag/FlowCanvas";
import { Integrations } from "@/components/ui/integrations";

export default function Actions({
  projects,
  flows,
  flow,
  runners,
  user,
  canEdit,
  settings,
}: {
  projects: any;
  flows: any;
  flow: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={containerVariants}
    >
      <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
        <Card.Header className="flex gap-3 items-center px-6 py-4">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Icon icon="hugeicons:structure-04" width={24} />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-bold">Flow Actions</p>
            <p className="text-sm text-muted">
              Connect actions to define the execution graph of your flow.
            </p>
          </div>
        </Card.Header>
      </Card>

      {!flow.actions || flow.actions.length === 0 ? (
        <div className="relative z-10 h-[500px] w-full overflow-hidden rounded-xl border border-default bg-surface/30">
          <Integrations />
        </div>
      ) : (
        <FlowCanvas
          canEdit={canEdit}
          flow={flow}
          flows={flows}
          projects={projects}
          runners={runners}
          settings={settings}
          user={user}
        />
      )}
    </motion.div>
  );
}
