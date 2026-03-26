import useSWR from "swr";

import GetSelfServicePages from "@/lib/fetch/selfservice/GET/all";
import GetSelfServicePage from "@/lib/fetch/selfservice/GET/page";

export function useSelfServicePages() {
  const { data, error, mutate, isLoading } = useSWR(
    "self-service-pages",
    () => GetSelfServicePages(),
  );

  return {
    pages: data?.success ? data.data.pages : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

export function useSelfServicePage(slugOrID: string) {
  const { data, error, mutate, isLoading } = useSWR(
    slugOrID ? `self-service-page-${slugOrID}` : null,
    () => GetSelfServicePage(slugOrID),
  );

  return {
    page: data?.success
      ? {
          ...(data.data as any).page,
          page_flows:
            (data.data as any).page_flows ??
            (data.data as any).page?.page_flows,
        }
      : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}
