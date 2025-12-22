/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

import { fetchCompanyPermissions } from "../api/permissions.api";
import type {
  PermissionSettingsResponse,
  UpdateCompanyPermissionsPayload,
} from "../types/permissions.type";

export function usePermissions() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const { data, isLoading, isError, error } =
    useQuery<PermissionSettingsResponse>({
      queryKey: ["permissions"],
      enabled: !!session?.backendTokens?.accessToken,
      queryFn: async () => fetchCompanyPermissions(axiosInstance),
      refetchOnMount: true,
    });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  // Derived values (safe memo, optional)
  const defaultSelectedRoleId = useMemo(() => {
    return data?.roles?.[0]?.id ?? null;
  }, [data]);

  // Local UI state (what the user is editing)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [localRolePermissions, setLocalRolePermissions] = useState<
    Record<string, string[]>
  >({});

  // Prevent overwriting local edits on background refetches
  const didHydrateRef = useRef(false);

  const syncFromData = useEffectEvent(
    (payload: {
      rolePermissions: Record<string, any> | null | undefined;
      roles: Array<{ id: string }> | null | undefined;
      defaultRoleId: string | null | undefined;
      selectedRole: string | null | undefined;
    }) => {
      const { rolePermissions, roles, defaultRoleId, selectedRole } = payload;

      // Hydrate local state once when data becomes available
      if (!didHydrateRef.current) {
        setLocalRolePermissions(rolePermissions ?? {});
        setSelectedRole((prev) => prev ?? defaultRoleId ?? null);
        didHydrateRef.current = true;
        return;
      }

      // If roles changed and selectedRole is no longer valid, reselect safely
      if (selectedRole && roles?.length) {
        const stillExists = roles.some((r) => r.id === selectedRole);
        if (!stillExists) {
          setSelectedRole(defaultRoleId ?? null);
        }
      } else if (!selectedRole) {
        setSelectedRole(defaultRoleId ?? null);
      }
    }
  );

  useEffect(() => {
    if (!data) return;

    syncFromData({
      rolePermissions: data.rolePermissions,
      roles: data.roles,
      defaultRoleId: defaultSelectedRoleId,
      selectedRole,
    });
  }, [data, defaultSelectedRoleId, selectedRole]);

  const togglePermission = (permId: string, checked: boolean) => {
    if (!selectedRole) return;

    setLocalRolePermissions((prev) => {
      const current = new Set(prev[selectedRole] ?? []);
      if (checked) current.add(permId);
      else current.delete(permId);

      return { ...prev, [selectedRole]: Array.from(current) };
    });
  };

  const saveMutation = useUpdateMutation<UpdateCompanyPermissionsPayload>({
    endpoint: "/api/permissions",
    successMessage: "Permissions updated successfully!",
    refetchKey: "permissions",
    method: "PATCH",
  });

  const save = async (
    setError?: (msg: string | null) => void,
    onDone?: () => void
  ) => {
    return saveMutation(
      { rolePermissions: localRolePermissions },
      setError,
      onDone
    );
  };

  return {
    sessionStatus: status,

    data,
    roles: data?.roles ?? [],
    permissions: data?.permissions ?? [],

    selectedRole,
    setSelectedRole,

    localRolePermissions,
    setLocalRolePermissions,

    togglePermission,

    isLoading,
    isError,
    fetchError,

    save, // (setError?, onDone?)
  };
}
