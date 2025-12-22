export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = error;

    // axios: error.response.data.error.message
    const message =
      err?.response?.data?.error?.message ??
      err?.response?.data?.message ??
      err?.message;

    // message can be string or string[]
    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  // 3️⃣ Raw string
  if (typeof error === "string") {
    return error;
  }

  // 4️⃣ Fallback
  return "Something went wrong";
};
