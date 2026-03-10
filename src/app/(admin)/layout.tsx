import { redirect } from "next/navigation";

import AdminSidebar from "@/features/admin-nav/ui/admin-sidebar";
import { AdminTopNav } from "@/features/admin-nav/ui/admin-top-nav";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { MobileAppNav } from "@/features/admin-nav/ui/mobile-app-nav";
import { getServerAuthSession } from "@/lib/auth/auth-options";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerAuthSession();

  // 🚫 No session → send user to homepage
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed full-width nav */}
      <AdminTopNav />

      {/* Push content under fixed nav */}
      <div className="pt-18">
        {/* Fixed sidebar */}
        <AdminSidebar />

        {/* Main area */}
        <div className="w-full md:ml-[14.5%] md:w-[calc(100%-14.5%)]">
          <main className="min-h-[calc(100vh-4.5rem)]">
            <ScrollToTop />

            <div className="px-3 py-3 pb-20 sm:px-6 sm:pb-10">
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
