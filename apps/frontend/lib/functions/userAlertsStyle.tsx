import { create } from "zustand";
import { persist } from "zustand/middleware";

type DisplayStyle = "list";

interface AlertsStyleStore {
  displayStyle: DisplayStyle;
  setDisplayStyle: (style: DisplayStyle) => void;
}

export const useAlertsStyleStore = create<AlertsStyleStore>()(
  persist(
    (set) => ({
      displayStyle: "list",
      setDisplayStyle: (style) => set({ displayStyle: style }),
    }),
    {
      name: "alertsDisplayStyle", // key in localStorage
    },
  ),
);

// Usage example in a component:
// const { displayStyle, setDisplayStyle } = useAlertsStyleStore();
