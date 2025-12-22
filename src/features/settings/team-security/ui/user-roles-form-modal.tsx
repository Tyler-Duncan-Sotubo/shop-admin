"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input"; // or "@/shared/ui/input" (use your actual path)
import FormError from "@/shared/ui/form-error"; // adjust if needed

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
import type { User } from "../types/user.type";
import { userInviteSchema, UserInviteValues } from "../schema/user.schema";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import Loading from "@/shared/ui/loading";
import { useUserRoles } from "../hooks/use-user-roles";

type Props = {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
  user?: User | null;
};

export default function UsersAndRoleFormModal({
  open,
  onClose,
  isEditing = false,
  user,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: rolesIsError,
  } = useUserRoles(open);

  const form = useForm<UserInviteValues>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      name: "",
      email: "",
      companyRoleId: "",
    },
  });

  // hydrate/reset when switching modes or user changes
  useEffect(() => {
    if (isEditing && user) {
      form.reset({
        name: user.name,
        email: user.email,
        companyRoleId: user.companyRoleId,
      });
      return;
    }

    // invite mode
    form.reset({
      name: "",
      email: "",
      companyRoleId: "",
    });
  }, [isEditing, user, form]);

  const createInvite = useCreateMutation({
    endpoint: "/api/auth/invite",
    successMessage: "User invite sent successfully",
    refetchKey: "users",
  });

  const updateRole = useUpdateMutation<{ role: string }>({
    endpoint: `/api/auth/edit-user-role/${user?.id}`,
    successMessage: "User role updated successfully",
    refetchKey: "users",
    method: "PATCH",
  });

  // FormModal gives us a native form submit event, but we still want RHF validation
  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    if (isEditing) {
      if (!user?.id) {
        setError("No user selected.");
        return;
      }

      // edit mode: update role only
      await updateRole({ role: values.companyRoleId }, setError, onClose);
      return;
    }

    // create mode: invite user
    await createInvite(values, setError, form.reset, onClose);
  });

  if (rolesLoading) return <Loading />;
  if (rolesIsError) return <FormError message="Failed to load roles." />;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Invite User"}
      description={
        isEditing
          ? "Update the user’s role and permissions."
          : "Invite a teammate and assign an initial role."
      }
      mode={isEditing ? "edit" : "create"}
      submitLabel={isEditing ? "Save" : "Send invite"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={onSubmit}
    >
      <Form {...form}>
        <div className="space-y-4">
          {!isEditing && (
            <>
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
            </>
          )}

          <FormField
            control={form.control}
            name="companyRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="capitalize">
                    {roles.map((r: { id: string; name: string }) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <FormError message={error} />}
        </div>
      </Form>
    </FormModal>
  );
}
