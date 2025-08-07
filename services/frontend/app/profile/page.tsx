import { cookies } from "next/headers";

import ProfilePageClient from "@/components/user/profile-page-client";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  return <ProfilePageClient session={session} />;
}
