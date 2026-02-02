"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";
import { FaCog } from "react-icons/fa";

import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";
import { StoreSwitcher } from "@/features/admin-nav/ui/store-select";

import { useNewContactEmailCount } from "@/features/contact-emails/hooks/use-contact-emails";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

export function AdminTopNav() {
  const axios = useAxiosAuth();
  const pathname = usePathname();
  const { data: session } = useSession();
  const avatar = session?.user?.avatar || "";

  const { activeStoreId, setActiveStoreId } = useStoreScope();
  const { stores } = useStores();

  const { data: unreadCount = 0 } = useNewContactEmailCount(
    session,
    axios,
    activeStoreId,
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b flex items-center px-4 sm:px-6 gap-3">
      {/* Left: logo + (mobile) store switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/apple-touch-icon.png"
            alt="Logo"
            width={28}
            height={28}
            priority
          />
        </Link>

        {/* ✅ Store selector on mobile only */}
        <div className="md:hidden min-w-0">
          <StoreSwitcher
            stores={stores}
            value={activeStoreId}
            onChange={setActiveStoreId}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/contact-emails"
          className="relative flex items-center justify-center text-gray-600 hover:text-black"
          aria-label="Contact emails"
        >
          <Mail size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <Link href="/settings" aria-label="Settings">
          <FaCog
            size={21}
            className={`text-gray-600 hover:text-primary cursor-pointer ${
              pathname === "/settings" ? "text-primary" : ""
            }`}
          />
        </Link>

        <UserMenu
          name={session?.user?.firstName}
          email={session?.user?.email}
          avatar={avatar}
        />
      </div>
    </div>
  );
}
