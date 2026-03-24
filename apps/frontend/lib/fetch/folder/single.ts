"use server";

import { cookies } from "next/headers";

import { serverFetch } from "../serverFetch";

type Folder = {
  folder: object;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: Folder;
};

export async function GetFolder(
  folderID: any,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    const res = await serverFetch(`/api/v1/folders/${folderID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      timeout: 8000,
      retries: 1,
    });

    if (!res.ok) {
      const errorData = await res.json();

      return {
        success: false,
        error: `API error: ${res.status} ${res.statusText}`,
        message: errorData.message || "An error occurred",
      };
    }

    const data = await res.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to fetch folder",
    };
  }
}

export default GetFolder;
