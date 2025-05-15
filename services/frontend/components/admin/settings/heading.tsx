"use client";

import Reloader from "@/components/reloader/Reloader";

export default function AdminSettingsHeading() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">Page Settings</p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <Reloader circle refresh={10} />
        </div>
      </div>
    </main>
  );
}
