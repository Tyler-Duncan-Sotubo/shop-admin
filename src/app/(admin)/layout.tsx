"use client";

import AdminSidebar from "@/features/admin-nav/ui/admin-sidebar";
import { AdminTopNav } from "@/features/admin-nav/ui/admin-top-nav";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { MobileAppNav } from "@/features/admin-nav/ui/mobile-app-nav";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed full-width nav */}
      <AdminTopNav />

      {/* Push content under fixed nav (nav height = 4.5rem) */}
      <div className="pt-18">
        {/* Fixed sidebar (desktop only) */}
        <AdminSidebar />

        {/* Main area (transparent wrapper; width accounts for sidebar) */}
        <div className="w-full md:ml-[14.5%] md:w-[calc(100%-14.5%)]">
          <main className="min-h-[calc(100vh-4.5rem)]">
            <ScrollToTop />

            {/* ✅ "Content shell" gives nice weight without a massive white slab */}
            <div className="px-3 sm:px-6 pb-20 sm:pb-10 py-3">
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
