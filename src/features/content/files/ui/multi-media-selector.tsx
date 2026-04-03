"use client";

import { useState } from "react";
import { X, Upload, File } from "lucide-react";
import { MediaItem, MediaLibrary } from "./media-library";

type Props = {
  companyId: string;
  value?: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  accept?: "images" | "all";
  label?: string;
  max?: number;
  session?: { backendTokens?: { accessToken?: string } } | null;
};

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export function MultiMediaSelector({
  companyId,
  value = [],
  onChange,
  accept = "all",
  label,
  max,
  session,
}: Props) {
  const [open, setOpen] = useState(false);

  function remove(id: string) {
    onChange(value.filter((m) => m.id !== id));
  }

  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 6,
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {value.map((item) => (
          <div
            key={item.id}
            style={{
              position: "relative",
              width: 72,
              height: 72,
              borderRadius: 8,
              overflow: "hidden",
              border: "0.5px solid var(--color-border-secondary, #ccc)",
              flexShrink: 0,
            }}
          >
            {isImage(item.mimeType) ? (
              <img
                src={item.url}
                alt={item.fileName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-background-secondary)",
                }}
              >
                <File
                  size={20}
                  style={{ color: "var(--color-text-secondary)" }}
                />
              </div>
            )}

            <button
              onClick={() => remove(item.id)}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <X size={10} color="#fff" />
            </button>
          </div>
        ))}

        {(!max || value.length < max) && (
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 8,
              border: "0.5px dashed var(--color-border-secondary, #ccc)",
              background: "var(--color-background-secondary, #f5f5f5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontSize: 11,
            }}
          >
            <Upload size={16} />
            Add
          </button>
        )}
      </div>

      <MediaLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(newItems) => {
          const existing = new Set(value.map((m) => m.id));
          const merged = [
            ...value,
            ...newItems.filter((m) => !existing.has(m.id)),
          ];
          onChange(max ? merged.slice(0, max) : merged);
        }}
        companyId={companyId}
        multiple
        accept={accept}
        selected={value.map((m) => m.id)}
        session={session}
      />
    </div>
  );
}
