/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";

export function AdvancedJsonEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (next: any) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  // Keep editor in sync when value changes externally (reset/load)
  useMemo(() => {
    const next = JSON.stringify(value ?? {}, null, 2);
    setText(next);
    setParseError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const apply = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
    } catch (e: any) {
      setParseError(e?.message ?? "Invalid JSON");
    }
  };

  const format = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setParseError(e?.message ?? "Invalid JSON");
    }
  };

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Advanced</h3>
          <p className="text-xs text-muted-foreground">
            Paste full config JSON. Click Apply to update the draft.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={format}>
            Format
          </Button>
          <Button onClick={apply}>Apply</Button>
        </div>
      </div>

      <textarea
        className="w-full min-h-[420px] rounded-md border p-2 font-mono text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {parseError ? <p className="text-sm text-red-600">{parseError}</p> : null}
    </div>
  );
}
