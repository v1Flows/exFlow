import { cookies } from "next/headers";

import SparklesText from "@/components/magicui/sparkles-text";
import { subtitle } from "@/components/primitives";
import Login from "@/components/auth/login";

export default async function MaintenancePage() {
  const cookieStore = await cookies();
  const user = JSON.parse(cookieStore.get("user")?.value || "{}");
  const session = cookieStore.get("session")?.value;

  return (
    <section className="flex h-screen items-center justify-center">
      <div className="inline-block justify-center text-center">
        <SparklesText text="Maintenance Mode" />
        <h2 className={subtitle({ class: "mt-4" })}>
          We are currently in maintenance mode. Please come back later.
          Apologies for the inconvenience.
        </h2>
        <div className="mt-8 flex justify-center gap-4">
          <Login session={session} showSignUp={false} user={user} />
        </div>
      </div>
    </section>
  );
}
