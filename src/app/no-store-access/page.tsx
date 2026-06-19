// app/(dashboard)/no-store-access/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  Store,
  Lock,
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  Tag,
  Settings,
} from "lucide-react";

const page = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      {/* Left — message */}
      <div className="flex flex-col items-center justify-center gap-6 px-8 py-12 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <Store className="w-8 h-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">No Store Access</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Hi {session?.user?.firstName ?? "there"}, you don&apos;t have access
            to any stores yet. Please contact your administrator to get access.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>Signed in as</p>
          <p className="font-medium text-foreground">{session?.user?.email}</p>
        </div>
      </div>

      {/* Right — illustration */}
      <div className="items-center justify-center hidden min-h-full md:flex bg-muted">
        <div className="flex flex-col items-center gap-6 p-12 text-muted-foreground">
          {/* Main store icon */}
          <div className="relative">
            <div className="flex items-center justify-center w-32 h-32 rounded-3xl bg-muted-foreground/10">
              <Store className="w-16 h-16 text-muted-foreground/40" />
            </div>
            {/* Lock badge */}
            <div className="absolute flex items-center justify-center w-10 h-10 border-2 rounded-full -bottom-3 -right-3 bg-background border-muted">
              <Lock className="w-5 h-5 text-muted-foreground/60" />
            </div>
          </div>

          {/* Decorative store tiles */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShoppingBag, label: "Orders" },
              { icon: Package, label: "Products" },
              { icon: Users, label: "Customers" },
              { icon: BarChart2, label: "Analytics" },
              { icon: Tag, label: "Discounts" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center w-24 gap-2 p-4 rounded-xl bg-muted-foreground/5"
              >
                <Icon className="w-6 h-6 text-muted-foreground/30" />
                <span className="text-xs text-muted-foreground/40">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
