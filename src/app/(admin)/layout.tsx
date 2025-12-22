"use client";

import AdminSidebar from "@/features/admin-nav/ui/admin-sidebar";
import { AdminTopNav } from "@/features/admin-nav/ui/admin-top-nav";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <div
        className={`bg-white min-h-screen transition-all ease-in-out duration-500 ${
          sidebarCollapsed
            ? "md:ml-16 md:w-[calc(100%-4rem)]"
            : "md:ml-[16%] md:w-[84%]"
        }`}
      >
        <main>
          <AdminTopNav />
          <ScrollToTop />
          <div className="px-6 pb-10 py-3">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
