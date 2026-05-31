"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BiSolidLeftArrowSquare } from "react-icons/bi";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  href,
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const inner = (
    <span
      className={cn(
        "group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors mb-4 hover:text-primary hover:font-bold",
        className,
      )}
    >
      <BiSolidLeftArrowSquare
        size={20}
        className="transition-transform group-hover:-translate-x-0.5"
      />
      <span>{label}</span>
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return (
    <button onClick={() => router.back()} className="outline-none">
      {inner}
    </button>
  );
}
