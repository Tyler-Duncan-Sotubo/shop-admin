"use client";

import { useState } from "react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import {
  apiRequestPasswordReset,
  RequestPasswordResetPayload,
} from "./password-reset.api";

export function usePasswordResetRequest() {
  const axiosInstance = useAxiosAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendPasswordResetRequest = async (
    payload: RequestPasswordResetPayload
  ) => {
    setError("");

    try {
      const res = await apiRequestPasswordReset(axiosInstance, payload);

      if (res.status === 201) {
        setSuccess(true);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const message =
          err.response.data.error.message ??
          getErrorMessage(err.response.data?.message);
        setError(message);
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  const resetState = () => {
    setError("");
    setSuccess(false);
  };

  return {
    error,
    success,
    sendPasswordResetRequest,
    resetState,
  };
}
