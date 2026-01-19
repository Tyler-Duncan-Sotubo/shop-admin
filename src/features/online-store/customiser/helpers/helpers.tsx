/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { StorefrontSectionId } from "../ui/customiser-sidebar";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";

export function friendlyTitle(section: StorefrontSectionId) {
  switch (section) {
    case "appearance":
      return "Branding";
    case "header":
      return "Header";
    case "homepage":
      return "Homepage";
    case "footer":
      return "Footer";
    case "seo":
      return "SEO";
    case "advanced":
      return "Advanced settings";
    default:
      return "Editor";
  }
}

export function Panel({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description?: string;
  tone?: "default" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        tone === "warning" && "border-amber-200 bg-amber-50"
      )}
    >
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {description ? (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function LabeledInput({
  label,
  hint,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={cn("space-y-1", disabled && "opacity-60")}>
      <div className="text-xs font-medium">{label}</div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {hint ? (
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}

export function LabeledSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="text-sm font-medium">{label}</div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{value}</div>
    </div>
  );
}

export function ActionRow({
  onSave,
  saveLabel = "Save",
}: {
  onReset: () => void;
  onSave?: () => void;
  saveLabel?: string;
  resetLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <Button className="w-full" onClick={onSave}>
        {saveLabel}
      </Button>
    </div>
  );
}

export function LabeledColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium">{label}</div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded border"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-9 w-full rounded-md border px-3 text-sm"
        />
      </div>
    </div>
  );
}

export function findSectionIndex(sections: any[], type: string) {
  return sections.findIndex((s) => s?.type === type);
}

export function sectionEnabled(sections: any[], type: string, fallback = true) {
  const i = findSectionIndex(sections, type);
  return i >= 0 ? !!sections[i]?.enabled : fallback;
}
