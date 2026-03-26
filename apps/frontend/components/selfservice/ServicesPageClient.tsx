"use client";

import { Button, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import PageCard from "@/components/selfservice/PageCard";
import { useSelfServicePages } from "@/lib/swr/hooks/selfservice";
import { useUserDetails } from "@/lib/swr/hooks/flows";

export default function ServicesPageClient() {
  const router = useRouter();
  const { pages, isLoading } = useSelfServicePages();
  const { user } = useUserDetails();

  const canManage =
    user?.role === "admin" || user?.role === "editor";

  return (
    <div className="p-4 space-y-6">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-default-400 text-sm mt-1">
            Run self-service workflows and automate tasks.
          </p>
        </div>
        {canManage && (
          <Button
            color="primary"
            startContent={<Icon icon="hugeicons:add-01" width={18} />}
            onPress={() => router.push("/services/create")}
          >
            New Service Page
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-default-400"
          initial={{ opacity: 0 }}
        >
          <Icon icon="hugeicons:layout-01" width={56} />
          <p className="mt-4 text-lg font-medium">No service pages yet</p>
          {canManage && (
            <p className="text-sm mt-1">
              Create your first service page to get started.
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
        >
          {pages.map((page) => (
            <motion.div
              key={page.id}
              variants={{
                hidden: { y: 16, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <PageCard page={page} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
