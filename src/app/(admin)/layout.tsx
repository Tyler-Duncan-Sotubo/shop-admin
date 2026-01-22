// layout.tsx
"use client";

import AdminSidebar from "@/features/admin-nav/ui/admin-sidebar";
import { AdminTopNav } from "@/features/admin-nav/ui/admin-top-nav";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { useState } from "react";
import { MobileAppNav } from "@/features/admin-nav/ui/mobile-app-nav";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <div
        className={`bg-white min-h-screen transition-all ease-in-out duration-500 w-full ${
          sidebarCollapsed
            ? "md:ml-16 md:w-[calc(100%-4rem)]"
            : "md:ml-[16%] md:w-[84%]"
        }`}
      >
        <main>
          <AdminTopNav />
          <ScrollToTop />

          {/* ✅ mobile padding smaller + bottom padding for nav */}
          <div className="px-3 sm:px-6 pb-20 sm:pb-10 py-3">{children}</div>

          {/* ✅ Mobile App Nav */}
          <MobileAppNav />
        </main>
      </div>
    </div>
  );
};

export default Layout;
