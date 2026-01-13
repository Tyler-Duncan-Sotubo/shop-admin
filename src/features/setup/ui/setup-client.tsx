"use client";

import { useRouter } from "next/navigation";
import { SetupStep1Store } from "./setup-step-1-store";
import { useCompleteSetup } from "../hooks/use-setup";

export default function SetupClient() {
  const router = useRouter();
  const completeSetup = useCompleteSetup();

  return (
    <section className="mx-auto py-10 space-y-6 bg-white min-h-screen">
      <div className="w-[95%] max-w-4xl mx-auto">
        <h1 className="text-4xl mb-2">You’re almost there</h1>
        <p> Complete setup to access the full dashboard.</p>
        <SetupStep1Store
          onSuccess={async () => {
            await completeSetup({});
            router.push("/dashboard");
          }}
        />
      </div>
    </section>
  );
}
