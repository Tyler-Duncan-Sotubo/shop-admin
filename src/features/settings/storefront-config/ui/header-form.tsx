/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type LinkItem = { label: string; href: string };

export function HeaderForm({
  value,
  onChange,
}: {
  value: any;
  onChange: (next: any) => void;
}) {
  const header = value ?? {};
  const links: LinkItem[] = useMemo(() => header.links ?? [], [header.links]);

  const setHeader = (patch: any) => onChange({ ...header, ...patch });

  const updateLink = (idx: number, patch: Partial<LinkItem>) => {
    const next = links.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    setHeader({ links: next });
  };

  const addLink = () =>
    setHeader({ links: [...links, { label: "", href: "" }] });

  const removeLink = (idx: number) =>
    setHeader({ links: links.filter((_, i) => i !== idx) });

  const moveLink = (idx: number, dir: -1 | 1) => {
    const next = [...links];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item);
    setHeader({ links: next });
  };

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Header</h3>
        <Button
          variant="outline"
          onClick={() =>
            onChange({
              variant: "leftLogo",
              showSearch: true,
              sticky: true,
              links: [],
            })
          }
        >
          Reset defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Variant</label>
          <Input
            value={header.variant ?? ""}
            onChange={(e) => setHeader({ variant: e.target.value })}
            placeholder="leftLogo | centerLogo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Show search</label>
          <Input
            value={String(header.showSearch ?? true)}
            onChange={(e) =>
              setHeader({ showSearch: e.target.value === "true" })
            }
            placeholder="true | false"
          />
          <p className="text-xs text-muted-foreground">
            MVP: use “true/false”. Later swap to a toggle.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Sticky</label>
          <Input
            value={String(header.sticky ?? true)}
            onChange={(e) => setHeader({ sticky: e.target.value === "true" })}
            placeholder="true | false"
          />
        </div>
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Navigation links</p>
          <Button variant="outline" onClick={addLink}>
            Add link
          </Button>
        </div>

        {links.length === 0 ? (
          <p className="text-xs text-muted-foreground">No links yet.</p>
        ) : null}

        <div className="space-y-2">
          {links.map((l, idx) => (
            <div key={idx} className="rounded-md border p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Label</label>
                  <Input
                    value={l.label}
                    onChange={(e) => updateLink(idx, { label: e.target.value })}
                    placeholder="Shop"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Href</label>
                  <Input
                    value={l.href}
                    onChange={(e) => updateLink(idx, { href: e.target.value })}
                    placeholder="/collections/all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => moveLink(idx, -1)}>
                  Up
                </Button>
                <Button variant="outline" onClick={() => moveLink(idx, 1)}>
                  Down
                </Button>
                <Button variant="outline" onClick={() => removeLink(idx)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
