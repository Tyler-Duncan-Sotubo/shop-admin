/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const responseData = error.response.data;
    if (
      responseData?.error?.message &&
      Array.isArray(responseData.error.message) &&
      responseData.error.message.every((item: { error: any }) => item.error)
    ) {
      return responseData.error.message
        .map((item: { error: any }) => item.error)
        .join(" | ");
    }

    return (
      responseData?.error?.message || "An unexpected server error occurred."
    );
  }

  return typeof error === "string" ? error : "An unknown error occurred.";
}
