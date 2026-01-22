/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users as UsersIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";

import { useUsersAndRoles } from "../hooks/use-users-and-roles";
import { useUserRoles } from "../hooks/use-user-roles";

import { UsersTable } from "./users-table";
import { RolesTable } from "./roles-table";
import SecuritySettingsSection from "./security-settings";
import SecurityHistoryTab from "../../audit/ui/security-history-tab";

const TAB_VALUES = [
  "users",
  "roles",
  "two-factor",
  "security-history",
] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string | null): v is TabValue {
  return !!v && (TAB_VALUES as readonly string[]).includes(v);
}

type TabChip = {
  value: TabValue;
  label: string;
};

const TAB_CHIPS: TabChip[] = [
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "two-factor", label: "Security & Access" },
  { value: "security-history", label: "Security history" },
];

function MobileTabChips({
  value,
  onChange,
}: {
  value: TabValue;
  onChange: (v: TabValue) => void;
}) {
  return (
    <div className="sm:hidden">
      <div className="flex flex-wrap gap-2">
        {TAB_CHIPS.map((t) => {
          const active = value === t.value;

          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className="active:scale-[0.98]"
            >
              <Badge
                variant="secondary"
                className={cn(
                  "rounded-full px-3 py-1 text-xs cursor-pointer select-none",
                  "bg-transparent border",
                  active
                    ? "font-semibold text-primary border-primary/40"
                    : "text-muted-foreground",
                )}
              >
                {t.label}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamAndSecurity() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const initialTab: TabValue = isTabValue(tabFromUrl) ? tabFromUrl : "users";

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (isTabValue(t) && t !== activeTab) setActiveTab(t);
    if (!t && activeTab !== "users") setActiveTab("users");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { users, isLoading, isError, fetchError, openEdit } =
    useUsersAndRoles();

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: rolesIsError,
    error: rolesError,
  } = useUserRoles(true);

  const rolesData = useMemo(() => {
    return roles.map((r: any) => ({
      name: r.displayName ?? r.name,
      description: r.description ?? "",
    }));
  }, [roles]);

  const handleTabChange = (next: string) => {
    const nextTab: TabValue = isTabValue(next) ? next : "users";
    setActiveTab(nextTab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChangeValue = (next: TabValue) => handleTabChange(next);

  if (isLoading || rolesLoading) return <Loading />;

  if (isError) {
    return (
      <div className="text-red-600">
        Error loading team and security settings: {fetchError}
      </div>
    );
  }

  if (rolesIsError) {
    return (
      <div className="text-red-600">
        Error loading roles: {(rolesError as any)?.message ?? "Error"}
      </div>
    );
  }

  const inviteHref = `/settings/invite?returnTo=${encodeURIComponent(
    "/settings/access-control",
  )}&tab=${encodeURIComponent(activeTab)}`;

  return (
    <div>
      <PageHeader
        title="Team and security"
        description="Manage users and roles to control access to the system."
        tooltip="Invite teammates, assign roles, and manage access to keep your account secure."
        icon={<UsersIcon className="h-5 w-5" />}
      >
        <Link href={inviteHref}>
          <Button>Invite user</Button>
        </Link>
      </PageHeader>

      <div className="mt-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="my-6">
            {/* ✅ Mobile chips */}
            <MobileTabChips value={activeTab} onChange={handleTabChangeValue} />

            {/* ✅ Desktop tabs */}
            <div className="hidden sm:flex items-center justify-between">
              <TabsList className="flex justify-start">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="two-factor">
                  Security &amp; Access
                </TabsTrigger>
                <TabsTrigger value="security-history">
                  Security history
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="users">
            <UsersTable data={users} onEdit={openEdit} />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTable data={rolesData} />
          </TabsContent>

          <TabsContent value="two-factor">
            <SecuritySettingsSection />
          </TabsContent>

          <TabsContent value="security-history">
            <SecurityHistoryTab enabled={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
