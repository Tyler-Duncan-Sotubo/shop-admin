/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export function PagesForm({
  value,
  onChange,
}: {
  value: any;
  onChange: (next: any) => void;
}) {
  const pages = value ?? {};
  const collection = pages.collection ?? {};
  const ui = collection.ui ?? {};
  const data = collection.data ?? {};

  const setPages = (patch: any) => onChange({ ...pages, ...patch });
  const setCollection = (patch: any) =>
    setPages({ collection: { ...collection, ...patch } });

  const setCollectionUi = (patch: any) =>
    setCollection({ ui: { ...ui, ...patch } });

  const setCollectionData = (patch: any) =>
    setCollection({ data: { ...data, ...patch } });

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Pages</h3>
        <Button
          variant="outline"
          onClick={() =>
            onChange({
              ...pages,
              collection: {
                ui: {
                  header: { variant: "withDescription" },
                  layout: { variant: "sidebarFilters", sidebarWidth: 260 },
                  sections: {
                    exploreMore: { enabled: true },
                    afterContent: { enabled: true },
                  },
                },
                data: { perPage: 24 },
              },
            })
          }
        >
          Reset collection defaults
        </Button>
      </div>

      {/* Collection editor */}
      <div className="rounded-lg border p-3 space-y-3">
        <p className="text-xs font-medium">Collection page</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Header variant</label>
            <Input
              value={ui?.header?.variant ?? ""}
              onChange={(e) =>
                setCollectionUi({
                  header: { ...(ui.header ?? {}), variant: e.target.value },
                })
              }
              placeholder="simple | withDescription"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Show description</label>
            <Input
              value={String(ui?.header?.showDescription ?? "")}
              onChange={(e) =>
                setCollectionUi({
                  header: {
                    ...(ui.header ?? {}),
                    showDescription: e.target.value === "true",
                  },
                })
              }
              placeholder="true | false | (blank for auto)"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Layout variant</label>
            <Input
              value={ui?.layout?.variant ?? ""}
              onChange={(e) =>
                setCollectionUi({
                  layout: { ...(ui.layout ?? {}), variant: e.target.value },
                })
              }
              placeholder="sidebarFilters | topFilters"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Sidebar width</label>
            <Input
              value={String(ui?.layout?.sidebarWidth ?? "")}
              onChange={(e) => {
                const n = Number(e.target.value);
                setCollectionUi({
                  layout: {
                    ...(ui.layout ?? {}),
                    sidebarWidth: Number.isFinite(n) ? n : 260,
                  },
                });
              }}
              placeholder="260"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Explore more</label>
            <Input
              value={String(ui?.sections?.exploreMore?.enabled ?? true)}
              onChange={(e) =>
                setCollectionUi({
                  sections: {
                    ...(ui.sections ?? {}),
                    exploreMore: { enabled: e.target.value === "true" },
                  },
                })
              }
              placeholder="true | false"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">After content</label>
            <Input
              value={String(ui?.sections?.afterContent?.enabled ?? true)}
              onChange={(e) =>
                setCollectionUi({
                  sections: {
                    ...(ui.sections ?? {}),
                    afterContent: { enabled: e.target.value === "true" },
                  },
                })
              }
              placeholder="true | false"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Per page</label>
            <Input
              value={String(data?.perPage ?? 24)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setCollectionData({ perPage: Number.isFinite(n) ? n : 24 });
              }}
              placeholder="24"
            />
          </div>
        </div>
      </div>

      {/* Home / other pages as JSON for MVP */}
      <div className="rounded-lg border p-3 space-y-2">
        <p className="text-xs font-medium">Home + other pages (JSON)</p>
        <textarea
          className="w-full min-h-[220px] rounded-md border p-2 font-mono text-xs"
          value={JSON.stringify(
            { ...(pages ?? {}), collection: undefined },
            null,
            2
          )}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              // keep collection settings intact
              setPages({ ...parsed, collection });
            } catch {
              // allow typing
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          MVP: edit home sections as JSON. Later you can add a real “sections
          editor”.
        </p>
      </div>
    </div>
  );
}
