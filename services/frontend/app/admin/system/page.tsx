import { Divider, Spacer } from "@heroui/react";

import AdminSystemHeading from "@/components/admin/system/heading";
import AdminGetPageSettings from "@/lib/fetch/admin/settings";
import { AdminSystemSettings } from "@/components/admin/system/settings";
import { AdminSystemStatus } from "@/components/admin/system/status";

export default async function AdminSettingsPage() {
  const settingsData = AdminGetPageSettings();

  const [settings] = (await Promise.all([settingsData])) as any;

  return (
    <main>
      <AdminSystemHeading />
      <Divider className="mt-4 mb-4" />
      <AdminSystemStatus />
      <Spacer y={4} />
      <AdminSystemSettings settings={settings.data.settings} />
    </main>
  );
}
