import { create } from "zustand";
import { persist } from "zustand/middleware";

type DisplayStyle = "list" | "table";

interface ExecutionsStyleStore {
  displayStyle: DisplayStyle;
  setDisplayStyle: (style: DisplayStyle) => void;
}

export const useExecutionsStyleStore = create<ExecutionsStyleStore>()(
  persist(
    (set) => ({
      displayStyle: "list",
      setDisplayStyle: (style) => set({ displayStyle: style }),
    }),
    {
      name: "executionsDisplayStyle", // key in localStorage
    },
  ),
);

// Usage example in a component:
// const { displayStyle, setDisplayStyle } = useExecutionsStyleStore();
