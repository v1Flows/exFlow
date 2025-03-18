import { Divider } from "@heroui/react";

export default function Home() {
  return (
    <main>
      <div className="grid grid-cols-1 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Dashboard</p>
      </div>
      <Divider className="mt-4 mb-4" />
    </main>
  );
}
