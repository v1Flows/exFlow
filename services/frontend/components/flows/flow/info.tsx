import { Card, CardBody, CardHeader, Snippet } from "@heroui/react";
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
        <Card className="h-full bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
          <CardHeader className="flex gap-3 pb-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon icon="hugeicons:finger-print" width={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-bold">Flow Identity</p>
              <p className="text-small text-default-500">
                Unique identifiers for this flow.
              </p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Flow ID</p>
              <Snippet
                className="w-full"
                codeString={flow.id}
                symbol=""
                variant="bordered"
              >
                {flow.id}
              </Snippet>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Remote Execution */}
      <motion.div variants={itemVariants}>
        <Card className="h-full bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
          <CardHeader className="flex gap-3 pb-0">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <Icon icon="hugeicons:api" width={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-bold">Remote Execution</p>
              <p className="text-small text-default-500">
                Trigger this flow via API.
              </p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-success/10 text-success text-xs font-bold">
                  POST
                </span>
                <p className="text-sm font-medium">Endpoint</p>
              </div>
              <Snippet
                className="w-full"
                codeString={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/${flow.id}/execute`}
                symbol=""
                variant="bordered"
              >
                <span className="text-default-400">
                  {process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/
                </span>
                <span className="text-primary">{flow.id}</span>
                <span className="text-default-400">/execute</span>
              </Snippet>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Headers</p>
              <Snippet
                className="w-full"
                codeString={`Authorization: <your_api_token>`}
                symbol=""
                variant="bordered"
              >
                Authorization: &lt;your_api_token&gt;
              </Snippet>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
