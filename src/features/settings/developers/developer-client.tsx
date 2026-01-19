"use client";

import ApiKeysClient from "./api-keys/ui/api-keys-client";

export default function DeveloperClient() {
  return (
    <section className="space-y-6">
      <ApiKeysClient />
    </section>
  );
}
