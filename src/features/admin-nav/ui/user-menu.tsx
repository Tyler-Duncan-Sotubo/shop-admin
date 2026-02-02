"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, ChevronUp, LogOut, Settings, User } from "lucide-react";

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
  const [open, setOpen] = useState(false);

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 cursor-pointer outline-none"
          aria-label="Open user menu"
          aria-expanded={open}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatar ?? ""} alt={name ?? "Profile"} />
            <AvatarFallback>
              {initials ? (
                <span className="text-sm font-medium">{initials}</span>
              ) : (
                <FaUserCircle size={36} className="text-gray-400" />
              )}
            </AvatarFallback>
          </Avatar>

          {/* ✅ Chevron toggle */}
          <span className="text-gray-500">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
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

        {/* ✅ Logout (single click target, no nested Link needed) */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-md">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
