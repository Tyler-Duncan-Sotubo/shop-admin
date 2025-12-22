"use client";

import { useMemo } from "react";
import { Users as UsersIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";

import { useUsersAndRoles } from "../hooks/use-users-and-roles";
import { UsersTable } from "./users-table";
import { RolesTable } from "./roles-table";
import UsersAndRoleFormModal from "./user-roles-form-modal";
import Loading from "@/shared/ui/loading";
import SecuritySettingsSection from "./security-settings";
import SecurityHistoryTab from "../../audit/ui/security-history-tab";

export default function TeamAndSecurity() {
  const {
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
  } = useUsersAndRoles();

  const rolesData = useMemo(
    () => [
      {
        name: "Owner",
        description:
          "Full access to all settings, users, and security configuration.",
      },
      {
        name: "Manager",
        description:
          "Can manage users and day-to-day operations with limited settings access.",
      },
      {
        name: "Staff",
        description:
          "Access to day-to-day tasks like orders and inventory (limited settings).",
      },
      {
        name: "Support",
        description:
          "Restricted access for support/troubleshooting and assisting the team.",
      },
    ],
    []
  );

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-red-600">
        Error loading team and security settings: {fetchError}
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Team and security"
        description="Manage users and roles to control access to the system."
        tooltip="Invite teammates, assign roles, and manage access to keep your account secure."
        icon={<UsersIcon className="h-5 w-5" />}
      >
        <Button onClick={openInvite}>Invite user</Button>
      </PageHeader>

      <div className="mt-8">
        <Tabs defaultValue="users" className="w-full">
          <div className="flex items-center justify-between my-8">
            <TabsList className="flex justify-start">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>

              {/* Future tabs */}
              <TabsTrigger value="two-factor">Security & Access</TabsTrigger>
              <TabsTrigger value="security-history">
                Security history
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <UsersTable data={users} onEdit={openEdit} />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTable data={rolesData} />
          </TabsContent>

          {/* Future sections */}
          <TabsContent value="two-factor">
            <SecuritySettingsSection />
          </TabsContent>

          <TabsContent value="security-history">
            <SecurityHistoryTab enabled={true} />
          </TabsContent>
        </Tabs>
      </div>

      <UsersAndRoleFormModal
        open={isOpen}
        onClose={closeModal}
        isEditing={isEditing}
        user={selectedUser}
      />
    </div>
  );
}
