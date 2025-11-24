"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { isAppleDevice } from "@react-aria/utils";

interface SearchContextType {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  projects: any[];
  flows: any[];
  folders: any[];
  setContextData: (data: {
    projects: any[];
    flows: any[];
    folders: any[];
  }) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ projects: [], flows: [], folders: [] });

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const setContextData = useCallback((newData: any) => {
    setData(newData);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    // eslint-disable-next-line no-undef
    const onKeyDown = (e: KeyboardEvent) => {
      const hotkey = isAppleDevice() ? "metaKey" : "ctrlKey";

      if (e?.key?.toLowerCase() === "k" && e[hotkey]) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    // eslint-disable-next-line no-undef
    document.addEventListener("keydown", onKeyDown);

    return () => {
      // eslint-disable-next-line no-undef
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
        projects: data.projects,
        flows: data.flows,
        folders: data.folders,
        setContextData,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}
