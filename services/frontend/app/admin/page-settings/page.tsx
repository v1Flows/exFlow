import { Divider } from "@heroui/react";

import AdminSettingsHeading from "@/components/admin/settings/heading";
import AdminGetPageSettings from "@/lib/fetch/admin/settings";
import { AdminSettings } from "@/components/admin/settings/list";

export default async function AdminSettingsPage() {
  const settingsData = AdminGetPageSettings();

  const [settings] = (await Promise.all([settingsData])) as any;

  return (
    <main>
      <AdminSettingsHeading />
      <Divider className="mt-4 mb-4" />
      <AdminSettings settings={settings.data.settings} />
    </main>
  );
}
