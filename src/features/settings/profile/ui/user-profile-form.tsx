"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, Pencil } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import Loading from "@/shared/ui/loading";
import FormError from "@/shared/ui/form-error";
import { FaUser } from "react-icons/fa";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import { useProfile } from "../hooks/use-profile";
import { ProfileSchema } from "../schema/profile.schema";
import { cn } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";

export default function UserProfileForm() {
  const {
    user,
    sessionStatus,
    isLoading,
    isError,
    fetchError,
    uploadedImage,
    onDrop,
    submit,
  } = useProfile();

  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState<number>(() => Date.now());

  const withVersion = (url?: string) => {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${avatarVersion}`;
  };

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      avatar: "",
      first_name: "",
      last_name: "",
      email: "",
    },
    mode: "onChange",
    values: user
      ? {
          avatar: user.avatar ?? "",
          first_name: user.first_name ?? "",
          last_name: user.last_name ?? "",
          email: user.email ?? "",
        }
      : undefined,
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => onDrop(acceptedFiles, form.setValue),
    [onDrop, form.setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [] },
    multiple: false,
    disabled: !isEditing, // ✅ only allow drag/drop in edit mode
  });

  const rawAvatar = form.getValues("avatar"); // usually the saved URL
  const avatarSrc = uploadedImage || (rawAvatar ? withVersion(rawAvatar) : "");

  const fullName = useMemo(() => {
    const first = form.getValues("first_name") || user?.first_name || "";
    const last = form.getValues("last_name") || user?.last_name || "";
    return `${first} ${last}`.trim() || "—";
  }, [user, form]);

  if (sessionStatus === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-sm text-destructive">
        {fetchError ?? "Error loading profile"}
      </p>
    );

  const onCancel = () => {
    setError(null);
    setIsEditing(false);
    // reset back to last loaded user values
    if (user) {
      form.reset({
        avatar: user.avatar ?? "",
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
      });
    }
  };

  return (
    <section>
      <PageHeader
        title="Profile"
        description="Update your profile information and settings."
        tooltip="Manage your personal details like name and profile picture. Your email is used for login and can’t be changed."
        icon={<FaUser size={20} />}
      />

      <div className="mt-10 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Profile details</CardTitle>
              <CardDescription>
                View your details, or edit them when needed.
              </CardDescription>
            </div>

            {!isEditing ? (
              <Button variant="clean" onClick={() => setIsEditing(true)}>
                <Pencil />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="clean"
                  onClick={onCancel}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(async (values) => {
                    await submit(values, setError, () => {
                      setAvatarVersion(Date.now()); // ✅ cache-bust after save
                      setIsEditing(false);
                    });
                  })}
                  isLoading={form.formState.isSubmitting}
                >
                  Save changes
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar + summary row */}
            <div className="flex flex-col items-start gap-6">
              <div
                {...getRootProps()}
                className={cn(
                  "border rounded-lg w-full md:w-1/3 flex flex-col items-center justify-center p-8",
                  isEditing
                    ? "border-dashed cursor-pointer hover:border-primary"
                    : "bg-muted/30 cursor-default",
                  !isEditing && "pointer-events-none"
                )}
              >
                <input {...getInputProps()} />

                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Profile image"
                    className="rounded-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {isDragActive ? (
                      <p className="text-primary">Drop the file here…</p>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="h-5 w-5" />
                        <p>Drag & drop or click to upload</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/3 space-y-4">
                <div className="flex items-center gap-10 ">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{fullName}</p>
                </div>
                <div className="flex items-center gap-10">
                  <p className=" text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email ?? "—"}</p>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {isEditing
                    ? "Your email cannot be changed."
                    : "Click Edit to update your profile image or name."}
                </p>
              </div>
            </div>

            {/* Edit form (only when isEditing) */}
            {isEditing && (
              <Form {...form}>
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Your email is used for login and cannot be changed.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && <FormError message={error} />}
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
