import { create } from "zustand";
import { persist } from "zustand/middleware";

type DisplayStyle = "accordion" | "table";

interface ExecutionStepStyleStore {
  displayStyle: DisplayStyle;
  setDisplayStyle: (style: DisplayStyle) => void;
}

export const useExecutionStepStyleStore = create<ExecutionStepStyleStore>()(
  persist(
    (set) => ({
      displayStyle: "accordion",
      setDisplayStyle: (style) => set({ displayStyle: style }),
    }),
    {
      name: "executionStepDisplayStyle", // key in localStorage
    },
  ),
);

// Usage example in a component:
// const { displayStyle, setDisplayStyle } = useExecutionsStyleStore();
