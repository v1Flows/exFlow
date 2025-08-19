"use client";

export default function AdminSettingsHeading() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | exFlow Settings
          </p>
        </div>
      </div>
    </main>
  );
}
