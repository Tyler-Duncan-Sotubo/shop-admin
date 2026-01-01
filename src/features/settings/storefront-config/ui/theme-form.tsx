/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export function ThemeForm({
  value,
  onChange,
}: {
  value: any;
  onChange: (next: any) => void;
}) {
  const theme = value ?? {};
  const colors = theme.colors ?? {};
  const button = theme.button ?? {};

  const setTheme = (patch: any) => onChange({ ...theme, ...patch });

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Theme</h3>
        <Button
          variant="outline"
          onClick={() =>
            onChange({
              logoUrl: "",
              colors: { brand: "", background: "", text: "" },
              button: { style: "solid", radius: 12 },
            })
          }
        >
          Reset defaults
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium">Logo URL</label>
        <Input
          value={theme.logoUrl ?? ""}
          onChange={(e) => setTheme({ logoUrl: e.target.value })}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">
          Use a hosted image URL (S3/R2/Cloudinary) or a static path.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Brand color</label>
          <Input
            value={colors.brand ?? ""}
            onChange={(e) =>
              setTheme({ colors: { ...colors, brand: e.target.value } })
            }
            placeholder="#1A3D2F"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Background</label>
          <Input
            value={colors.background ?? ""}
            onChange={(e) =>
              setTheme({ colors: { ...colors, background: e.target.value } })
            }
            placeholder="#ffffff"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Text</label>
          <Input
            value={colors.text ?? ""}
            onChange={(e) =>
              setTheme({ colors: { ...colors, text: e.target.value } })
            }
            placeholder="#111111"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Button style</label>
          <Input
            value={button.style ?? ""}
            onChange={(e) =>
              setTheme({ button: { ...button, style: e.target.value } })
            }
            placeholder="solid | outline | ghost"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">Button radius</label>
          <Input
            value={String(button.radius ?? "")}
            onChange={(e) => {
              const n = Number(e.target.value);
              setTheme({
                button: { ...button, radius: Number.isFinite(n) ? n : 0 },
              });
            }}
            placeholder="12"
          />
        </div>
      </div>

      <ThemePreview theme={theme} />
    </div>
  );
}

function ThemePreview({ theme }: { theme: any }) {
  const brand = theme?.colors?.brand ?? "#111827";
  const bg = theme?.colors?.background ?? "#ffffff";
  const text = theme?.colors?.text ?? "#111827";
  const radius = theme?.button?.radius ?? 12;
  const style = theme?.button?.style ?? "solid";

  const buttonStyle =
    style === "outline"
      ? {
          border: `1px solid ${brand}`,
          color: brand,
          background: "transparent",
        }
      : style === "ghost"
      ? { color: brand, background: "transparent" }
      : { background: brand, color: "white" };

  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs font-medium mb-2">Preview</p>
      <div
        className="rounded-lg border p-4 space-y-3"
        style={{ background: bg, color: text }}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md border" />
          <div className="space-y-1">
            <div className="text-sm font-semibold">Storefront</div>
            <div className="text-xs opacity-70">Theme tokens preview</div>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold"
          style={{ ...buttonStyle, borderRadius: radius }}
        >
          Button
        </button>
      </div>
    </div>
  );
}
