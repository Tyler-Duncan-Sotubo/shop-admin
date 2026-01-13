"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Button variant="link" className="p-0">
        <Link href={href} className="inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          <span>{label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="clean"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2"
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </Button>
  );
}
