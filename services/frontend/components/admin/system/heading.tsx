"use client";

import { Icon } from "@iconify/react";

export default function AdminSystemHeading() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="text-danger" icon="hugeicons:shield-01" width={28} />
          <p className="text-2xl font-bold">System</p>
        </div>
      </div>
    </main>
  );
}
