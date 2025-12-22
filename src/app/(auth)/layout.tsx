"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: content */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-xl">{children}</div>
      </div>

      {/* Right side: image panel */}
      <div className="hidden lg:flex flex-1 w-1/2 items-center justify-center bg-gray-100">
        <div className="relative w-3/4 h-3/4 max-w-md max-h-md">
          <Image
            src="/shop.svg"
            alt="Auth background"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
