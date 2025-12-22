"use client";

import { useState } from "react";
import { usePermissions } from "@/features/settings/permissions/hooks/use-permissions";
import FormError from "@/shared/ui/form-error";
import { Button } from "@/shared/ui/button";
import { RolesList } from "./roles-list";
import { PermissionsGrid } from "./permissions-grid";
import Loading from "@/shared/ui/loading";

export default function PermissionClient() {
  const {
    sessionStatus,
    roles,
    permissions,
    selectedRole,
    setSelectedRole,
    localRolePermissions,
    togglePermission,
    isLoading,
    isError,
    fetchError,
    save,
  } = usePermissions();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (sessionStatus === "loading" || isLoading) return <Loading />;
  if (isError) return <div>{fetchError ?? "Error"}</div>;

  const handleSave = async () => {
    setIsSubmitting(true);
    await save(setError, () => setIsSubmitting(false));
    setIsSubmitting(false);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Company Permission Management</h1>

      <div className="flex space-x-10 mt-10">
        <RolesList
          roles={roles}
          selectedRoleId={selectedRole}
          onSelect={setSelectedRole}
        />

        <PermissionsGrid
          permissions={permissions}
          selectedRoleId={selectedRole}
          rolePermissions={localRolePermissions}
          onToggle={togglePermission}
        />
      </div>

      <div className="flex justify-end mt-10">
        <Button onClick={handleSave} isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>

      {error && <FormError message={error} />}
    </div>
  );
}
