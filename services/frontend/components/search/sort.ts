import type { SearchResultItem } from "./data";

import { sortBy } from "lodash";

import { getPriorityValue } from "./component-files";

export const sortSearchCategoryItems = (items: SearchResultItem[]) => {
  return sortBy(items, [
    // Sort by 'isNew' values first
    (item: any) => item?.component?.attributes?.isNew,
    // Sort by 'featured' property: true values first
    (item: any) => item?.component?.attributes?.featured,
    // Sort by 'sortPriority'
    (item: any) => getPriorityValue(item?.component.attributes?.sortPriority),
    // Sort by 'groupOrder' in ascending order (lower values first)
    (item: any) => item?.component?.attributes?.groupOrder || 9999,
    // Then sort by 'name'
    "name",
  ]);
};
