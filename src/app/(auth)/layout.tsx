"use client";

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: content */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-xl">{children}</div>
      </div>

      {/* Right side: image panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019bbc22-ee74-7bfa-a6af-0a801a3d2e24/stores/019bbc3e-20be-7f38-85ed-c6867a6c0cfc/media/files/tmp/019edf37-8baa-721f-a37f-d75f7d9c64a9-shop.svg"
          alt="Auth background"
          className="w-3/4 max-w-md object-contain"
        />
      </div>
    </div>
  );
}
