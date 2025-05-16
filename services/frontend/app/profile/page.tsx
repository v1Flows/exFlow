import { cookies } from "next/headers";

import ErrorCard from "@/components/error/ErrorCard";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import { UserProfile } from "@/components/user/profile";

export default async function ProfilePage() {
  const c = await cookies();

  const settingsData = PageGetSettings();
  const userDetailsData = GetUserDetails();
  const session = c.get("session")?.value;

  const [settings, userDetails] = (await Promise.all([
    settingsData,
    userDetailsData,
  ])) as any;

  return (
    <>
      {settings.success && userDetails.success ? (
        <UserProfile
          session={session}
          settings={settings.data.settings}
          user={userDetails.data.user}
        />
      ) : (
        <ErrorCard
          error={settings.error || userDetails.error}
          message={settings.message || userDetails.message}
        />
      )}
    </>
  );
}
