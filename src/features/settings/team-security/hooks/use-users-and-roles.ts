"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/users.api";
import { User } from "../types/user.type";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";

export function useUsersAndRoles() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const { data, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => fetchUsers(axios),
    enabled: !!session?.backendTokens.accessToken,
    refetchOnMount: true,
  });

  const users = data ?? [];

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openInvite = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setIsOpen(true);
  };

  const openEdit = (user: User) => {
    setIsEditing(true);
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  // role label mapper (reusable)
  const roleLabel = useMemo(
    () => (role?: string) => {
      switch (role) {
        case "owner":
          return "Owner";
        case "manager":
          return "Manager";
        case "staff":
          return "Staff";
        case "support":
          return "Support";
        default:
          return "Unknown";
      }
    },
    []
  );

  return {
    users,
    isLoading,
    isError,
    fetchError,

    isOpen,
    isEditing,
    selectedUser,

    openInvite,
    openEdit,
    closeModal,

    roleLabel,
  };
}
