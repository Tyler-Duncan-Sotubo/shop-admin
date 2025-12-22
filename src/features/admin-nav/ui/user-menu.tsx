"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { FaUserCircle } from "react-icons/fa";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useEffect, useEffectEvent, useState } from "react";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export function UserMenu({ name, email, avatar }: UserMenuProps) {
  const [mounted, setMounted] = useState(false);

  const markMounted = useEffectEvent(() => {
    setMounted(true);
  });

  useEffect(() => {
    markMounted();
  }, []);

  const logout = useCreateMutation({
    endpoint: "/api/auth/logout",
    onSuccess: async () => {
      await signOut({ callbackUrl: "/login" });
    },
  });
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") ?? "";

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeStoreId");
    }
    await logout();
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full cursor-pointer outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatar ?? ""} alt={name ?? "Profile"} />
            <AvatarFallback>
              {initials ? (
                <span className="text-sm font-medium">{initials}</span>
              ) : (
                <FaUserCircle size={36} className="text-gray-400 " />
              )}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel className="space-y-0.5">
          <div className="text-sm font-medium">{name ?? "Account"}</div>
          {email ? (
            <div className="text-xs text-muted-foreground">{email}</div>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center"
        >
          <Link href="" onClick={() => handleLogout()}>
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <p className="text-md">Logout</p>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
