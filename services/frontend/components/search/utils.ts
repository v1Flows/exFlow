import { CategoryEnum, type SearchResultItem } from "./data";
import { searchData } from "./mock-data";

export function flattenSearchData(projects: any, flows: any, folders: any) {
  let flattened: SearchResultItem[] = [];

  Object.keys(searchData).forEach((key) => {
    let items = searchData[key as CategoryEnum] as SearchResultItem[];

    items = items.map((item) => {
      return {
        ...item,
        category: key,
      };
    });

    flattened = flattened.concat(items);
  });

  // Include projects data
  if (projects) {
    projects.forEach((project: any) => {
      flattened.push({
        category: CategoryEnum.PROJECTS,
        content: project.name,
        slug: project.id,
        url: `/projects/${project.id}`,
        group: {
          key: "projects",
          name: "Projects",
        },
        component: {
          icon: "hugeicons:ai-folder-01",
          slug: "project",
          name: "Project",
        },
      });
    });
  }

  // Include flows data
  if (flows) {
    flows.forEach((flow: any) => {
      flattened.push({
        category: CategoryEnum.FLOWS,
        content: flow.name,
        slug: flow.id,
        url: `/flows/${flow.id}`,
        group: {
          key: "flows",
          name: "Flows",
        },
        component: {
          icon: "hugeicons:workflow-square-10",
          slug: "flow",
          name: "Flow",
        },
      });
    });
  }

  // Include folders data
  if (folders) {
    folders.forEach((folder: any) => {
      flattened.push({
        category: CategoryEnum.FOLDERS,
        content: folder.name,
        slug: folder.id,
        url: `/folders/${folder.id}`,
        group: {
          key: "folders",
          name: "Folders",
        },
        component: {
          icon: "hugeicons:folder-01",
          slug: "folder",
          name: "Folder",
        },
      });
    });
  }

  return flattened;
}
