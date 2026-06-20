import { CopySnippet } from "@/components/ui/copy-snippet";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function FlowInfo({ flow }: { flow: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial="hidden"
      variants={containerVariants}
    >
      {/* Flow Identity */}
      <motion.div variants={itemVariants}>
        <Card className="h-full bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Header className="flex gap-3 pb-0">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Icon icon="hugeicons:finger-print" width={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-bold">Flow Identity</p>
              <p className="text-sm text-muted">
                Unique identifiers for this flow.
              </p>
            </div>
          </Card.Header>
          <Card.Content className="gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Flow ID</p>
              <CopySnippet className="w-full" value={flow.id}>
                {flow.id}
              </CopySnippet>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* Remote Execution */}
      <motion.div variants={itemVariants}>
        <Card className="h-full bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Header className="flex gap-3 pb-0">
            <div className="p-2 rounded-lg bg-default/10 text-default-foreground">
              <Icon icon="hugeicons:api" width={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-bold">Remote Execution</p>
              <p className="text-sm text-muted">Trigger this flow via API.</p>
            </div>
          </Card.Header>
          <Card.Content className="gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-success/10 text-success text-xs font-bold">
                  POST
                </span>
                <p className="text-sm font-medium">Endpoint</p>
              </div>
              <CopySnippet
                className="w-full"
                value={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/${flow.id}/execute`}
              >
                <span className="text-muted">
                  {process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/
                </span>
                <span className="text-accent">{flow.id}</span>
                <span className="text-muted">/execute</span>
              </CopySnippet>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Headers</p>
              <CopySnippet
                className="w-full"
                value={`Authorization: <your_api_token>`}
              >
                Authorization: &lt;your_api_token&gt;
              </CopySnippet>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}
