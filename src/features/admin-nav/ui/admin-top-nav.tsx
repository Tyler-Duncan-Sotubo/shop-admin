"use client";

import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";
import { UserMenu } from "./user-menu";
import { FaCog } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { StoreSelect } from "./store-select";
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
    activeStoreId
  );

  // default store (first one) if none selected
  useEffect(() => {
    if (!activeStoreId && stores.length > 0) {
      setActiveStoreId(stores[0].id);
    }
  }, [activeStoreId, stores, setActiveStoreId]);

  return (
    <div className="h-18 w-full bg-white flex items-center p-6 gap-6">
      {/* Store Selector */}
      <div className="flex items-center gap-2 text-gray-700 text-sm">
        <StoreSelect
          stores={stores}
          value={activeStoreId}
          onChange={setActiveStoreId}
        />
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-4">
        {/* Inbox / Contact Emails */}
        <Link
          href="/contact-emails"
          className="relative flex items-center justify-center text-gray-600 hover:text-black"
        >
          <Mail size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link href="/settings">
          <FaCog
            size={23}
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
