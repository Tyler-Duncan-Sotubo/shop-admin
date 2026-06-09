/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/team-security/invite/user-invite-client.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import FormError from "@/shared/ui/form-error";
import { Checkbox } from "@/shared/ui/checkbox";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import Loading from "@/shared/ui/loading";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { usePermissions } from "@/features/settings/permissions/hooks/use-permissions";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";

import { z } from "zod";
import { PermissionSwitchSelector } from "./permission-level-selector";
import { useQueryClient } from "@tanstack/react-query";

const inviteSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    mode: z.enum(["existing", "new"]),
    companyRoleId: z.string().optional(),
    roleName: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode === "existing" && !val.companyRoleId) {
      ctx.addIssue({
        code: "custom",
        path: ["companyRoleId"],
        message: "Select a role",
      });
    }
    if (
      val.mode === "new" &&
      (!val.roleName || val.roleName.trim().length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["roleName"],
        message: "Role name is required",
      });
    }
  });

type InviteValues = z.infer<typeof inviteSchema>;

export default function UserInviteClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [error, setError] = React.useState<string | null>(null);
  const [permissionIds, setPermissionIds] = React.useState<string[]>([]);
  const [storeIds, setStoreIds] = React.useState<string[]>([]);

  const { sessionStatus, roles, permissions, isLoading, isError, fetchError } =
    usePermissions();

  const { stores } = useStores();

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      mode: "existing",
      companyRoleId: "",
      roleName: "",
    },
  });

  const watchedMode = useWatch({
    control: form.control,
    name: "mode",
    defaultValue: "existing",
  });

  const mode = watchedMode || "existing";

  const inviteUser = useCreateMutation({
    endpoint: "/api/auth/invite",
    successMessage: "User invite sent successfully",
    refetchKey: ["users", "roles"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const toggleStore = (id: string) => {
    setStoreIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  if (sessionStatus === "loading" || isLoading) return <Loading />;
  if (isError)
    return <FormError message={fetchError ?? "Failed to load data."} />;

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    const payload: any =
      values.mode === "existing"
        ? {
            email: values.email,
            name: values.name,
            companyRoleId: values.companyRoleId,
            storeIds,
          }
        : {
            email: values.email,
            name: values.name,
            createRole: true,
            roleName: values.roleName,
            permissionIds,
            storeIds,
          };

    await inviteUser(payload, setError, () => {
      router.push("/settings/access-control?tab=roles");
    });
  });

  return (
    <div className="max-w-2xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Invite user</h1>
          <p className="text-sm text-muted-foreground">
            Invite a teammate and assign an existing role or create a new role.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={form.formState.isSubmitting}>
            Send invite
          </Button>
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* User */}
          <div>
            <p className="my-3 text-lg font-bold">User</p>
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <div className="pb-3">
              <p className="text-xl font-bold">Role</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <FormLabel className="m-0">Create new role</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Turn on to create a role during invite.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "new"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "new" : "existing")
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {mode === "existing" ? (
                <FormField
                  control={form.control}
                  name="companyRoleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Assign role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="capitalize">
                          {roles.map((r: any) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.displayName ?? r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>New role name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Warehouse Manager"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <PermissionSwitchSelector
                    permissions={permissions}
                    value={permissionIds}
                    onChange={setPermissionIds}
                  />
                </>
              )}

              {error && <FormError message={error} />}
            </div>
          </div>

          {/* Store Access */}
          <div>
            <div className="pb-3">
              <p className="text-xl font-bold">Store Access</p>
              <p className="text-sm text-muted-foreground">
                Select which stores this user can access.
              </p>
            </div>

            <div className="space-y-2">
              {stores.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No stores found.
                </p>
              ) : (
                stores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {store.imageUrl ? (
                        <img
                          src={store.imageUrl}
                          alt={store.name}
                          className="object-cover rounded-md w-7 h-7"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-xs font-bold rounded-md w-7 h-7 bg-muted">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium">{store.name}</span>
                    </div>
                    <Checkbox
                      checked={storeIds.includes(store.id)}
                      onCheckedChange={() => toggleStore(store.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
