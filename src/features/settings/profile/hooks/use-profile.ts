/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { fetchUserProfile } from "../api/profile.api";
import type { ProfileValues } from "../api/profile.api";
import { User } from "../types/profile.type";
import { isAxiosError } from "@/shared/api/axios";

export function useProfile() {
  const { data: session, status, update } = useSession(); // ✅ get update()
  const axios = useAxiosAuth();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User>({
    queryKey: ["user", "profile"],
    queryFn: async () => fetchUserProfile(axios),
    enabled: !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  const updateProfile = useUpdateMutation({
    endpoint: "/api/auth/profile",
    successMessage: "Profile Updated",
    refetchKey: "user",
    method: "PATCH",
  });

  const onDrop = useCallback((acceptedFiles: File[], setValue: any) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setValue("avatar", base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const submit = async (
    values: ProfileValues,
    setError?: (msg: string | null) => void,
    onDone?: () => void
  ) => {
    setError?.(null);

    try {
      // ✅ do update
      await updateProfile(values, setError);

      // ✅ refresh next-auth session so new avatar/name reflects everywhere
      await update();

      onDone?.();
    } catch (e) {
      if (isAxiosError(e) && e.response) {
        setError?.(e.response.data?.message ?? "Failed to update profile");
      } else {
        setError?.("Failed to update profile");
      }
    }
  };

  return {
    sessionStatus: status,
    user,
    isLoading,
    isError,
    fetchError,
    uploadedImage,
    setUploadedImage,
    onDrop,
    submit,
  };
}
