"use client";

import Reloader from "../reloader/Reloader";

export default function RunnersHeading() {
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Runners</p>
        <div className="flex flex-cols justify-end gap-2">
          <Reloader />
        </div>
      </div>
    </main>
  );
}
