import { redirect } from "next/navigation";

import AdminSidebar from "@/features/admin-nav/ui/admin-sidebar";
import { AdminTopNav } from "@/features/admin-nav/ui/admin-top-nav";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { MobileAppNav } from "@/features/admin-nav/ui/mobile-app-nav";
import { getServerAuthSession } from "@/lib/auth/auth-options";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminTopNav />

      <div className="pt-18">
        <AdminSidebar />

        <div className="w-full md:ml-[180px] md:w-[calc(100%-180px)]">
          <main className="min-h-[calc(100vh-4.5rem)]">
            <ScrollToTop />

            <div className="px-3 py-3 pb-20 sm:px-5 sm:pb-10">
              <div>{children}</div>
            </div>

            <MobileAppNav />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
