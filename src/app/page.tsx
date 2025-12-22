"use client";

import LoginForm from "@/features/auth/login/ui/login-form";
import Image from "next/image";

export default function Homepage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side: content */}
      <div className="flex flex-1 items-center justify-center bg-white p-8">
        <div className="w-full max-w-xl">
          <LoginForm />
        </div>
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
