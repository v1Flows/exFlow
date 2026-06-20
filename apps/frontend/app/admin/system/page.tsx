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
      <hr className="my-4 border-default" />
      <AdminSystemStatus />
      <div aria-hidden className="h-4" />
      <AdminSystemSettings settings={settings.data.settings} />
    </main>
  );
}
