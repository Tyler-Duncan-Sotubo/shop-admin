"use client";

import { Bell, MapPin } from "lucide-react";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/native-select";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useStores } from "@/features/stores/hooks/use-stores";
import { UserMenu } from "./user-menu";
import { FaCog } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function AdminTopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const avatar = session?.user?.avatar || "";

  const { activeStoreId, setActiveStoreId } = useStoreScope();
  const { stores } = useStores();

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
        <MapPin size={18} className="text-gray-500" />
        <NativeSelect
          className="w-56"
          value={activeStoreId ?? ""}
          onChange={(e) => setActiveStoreId(e.target.value || null)}
        >
          {stores.map((store) => (
            <NativeSelectOption
              key={store.id}
              value={store.id}
              className="text-gray-900"
            >
              {store.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-4">
        <button className="relative flex items-center justify-center text-gray-600 hover:text-black">
          <Bell size={22} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

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
