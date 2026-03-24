import type { Attributes, ComponentInfo } from "./data";

import { IMPORT_PATH_MATCH_REGEX, IMPORT_REGEX } from "./regex-constants";

export type ComponentCodeFiles = Record<string, string>;
export type SandpackFiles = {
  javascript?: ComponentCodeFiles;
  typescript?: ComponentCodeFiles;
};

export function updateImportPaths(code: string): string {
  return code.replace(IMPORT_REGEX, (match, p1, p2) => {
    const newImport = p2?.split("/").pop();

    return match.replace(`${p1}${p2}`, `./${newImport}`);
  });
}

export function processFiles(component: ComponentInfo, language: "ts" | "js") {
  const appCode = component.code?.find((f) =>
    f.fileName?.includes(component.slug),
  );
  let appCodeImportLineSortArray: RegExpMatchArray | null = null;

  if (appCode?.code) {
    appCodeImportLineSortArray = appCode?.code.match(IMPORT_PATH_MATCH_REGEX);
  }

  return component.code
    ?.filter((f) => f.language.includes(language))
    ?.sort((a, b) => {
      if (appCodeImportLineSortArray) {
        const aIndexFileName = a.fileName.split(".")[0];
        const aIndex = appCodeImportLineSortArray.findIndex((i) => {
          return i.includes(aIndexFileName);
        });
        const bIndexFileName = b.fileName.split(".")[0];
        const bIndex = appCodeImportLineSortArray.findIndex((i) => {
          return i.includes(bIndexFileName);
        });

        if (aIndexFileName === component.slug) {
          return -1;
        }
        if (bIndexFileName === component.slug) {
          return 1;
        }
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1 && bIndex === -1) {
          return -1;
        }
        if (bIndex !== -1 && aIndex === -1) {
          return 1;
        }

        // both are not in the import array
        if (aIndexFileName?.includes("cn")) {
          return 1;
        }
        if (bIndexFileName?.includes("cn")) {
          return -1;
        }
        if (aIndexFileName?.includes("types")) {
          return 1;
        }
        if (bIndexFileName?.includes("types")) {
          return -1;
        }

        return 0;
      }

      return 0;
    })
    ?.reduce((acc, curr) => {
      const name = curr.fileName?.split(".")[0];
      const extension = curr.fileName?.split(".")[1];
      const code = updateImportPaths(curr.code); // Ensure this function is defined

      if (name === component.slug) {
        acc[`App.${extension}`] = code;
      } else {
        acc[curr.fileName] = code;
      }

      return acc;
    }, {} as ComponentCodeFiles);
}

// Define a function to map 'sortPriority' to a numeric value for sorting
export const getPriorityValue = (priority: Attributes["sortPriority"]) => {
  const order = {
    high: 1,
    medium: 2,
    low: 3,
    undefined: 4,
  };

  if (!priority || !order[priority]) {
    return order.undefined;
  }

  return order[priority];
};
