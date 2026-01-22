"use client";

export default function Loading() {
  return (
    <div className="fixed left-0 top-0 z-9999 h-1 w-full pointer-events-none">
      {/* track */}
      <div className="h-full w-full bg-muted/40" />

      {/* moving bar */}
      <div className="absolute left-0 top-0 h-full w-[70%] bg-primary animate-loading-bar" />
    </div>
  );
}
