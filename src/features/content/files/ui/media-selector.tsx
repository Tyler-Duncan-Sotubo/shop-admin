"use client";

import { useState } from "react";
import { X, Image, File } from "lucide-react";
import { MediaItem, MediaLibrary } from "./media-library";

type Props = {
  companyId: string;
  value?: MediaItem | null;
  onChange: (item: MediaItem | null) => void;
  accept?: "images" | "all";
  label?: string;
  placeholder?: string;
  session?: { backendTokens?: { accessToken?: string } } | null;
};

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export function MediaSelector({
  companyId,
  value,
  onChange,
  accept = "all",
  label,
  placeholder = "Choose file…",
  session,
}: Props) {
  const [open, setOpen] = useState(false);

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

      <div
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          border: "0.5px solid var(--color-border-secondary, #ccc)",
          borderRadius: 8,
          cursor: "pointer",
          background: "var(--color-background-primary)",
          minHeight: 42,
        }}
      >
        {value ? (
          <>
            {isImage(value.mimeType) ? (
              <img
                src={value.url}
                alt={value.fileName}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "cover",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
            ) : (
              <File
                size={18}
                style={{ flexShrink: 0, color: "var(--color-text-secondary)" }}
              />
            )}
            <span
              style={{
                fontSize: 13,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--color-text-primary)",
              }}
            >
              {value.fileName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                color: "var(--color-text-secondary)",
              }}
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <Image
              size={16}
              style={{ color: "var(--color-text-secondary)", flexShrink: 0 }}
            />
            <span
              style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
            >
              {placeholder}
            </span>
          </>
        )}
      </div>

      <MediaLibrary
        open={open}
        onClose={() => setOpen(false)}
        onSelect={([item]) => onChange(item ?? null)}
        companyId={companyId}
        accept={accept}
        selected={value ? [value.id] : []}
        session={session}
      />
    </div>
  );
}
