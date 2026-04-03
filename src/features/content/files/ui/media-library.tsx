"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Search,
  Check,
  Image,
  File,
  Loader2,
  Trash2,
} from "lucide-react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetMediaFiles } from "../hooks/use-media";

export type MediaItem = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
  size?: number | null;
  source?: "media" | "product-image";
};

type MediaLibraryProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  companyId: string;
  multiple?: boolean;
  accept?: "images" | "all";
  selected?: string[];
  session?: { backendTokens?: { accessToken?: string } } | null;
};

function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export function MediaLibrary({
  open,
  onClose,
  onSelect,
  companyId,
  multiple = false,
  accept = "all",
  selected: controlledSelected = [],
  session,
}: MediaLibraryProps) {
  const { activeStoreId } = useStoreScope();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(controlledSelected),
  );
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, "pending" | "done" | "error">
  >({});
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const { data, isLoading, refetch } = useGetMediaFiles(
    {
      storeId: activeStoreId || undefined,
      search: debouncedSearch || undefined,
      limit: 60,
    },
    session,
  );

  const items: MediaItem[] = Array.isArray(data) ? (data as MediaItem[]) : [];

  useEffect(() => {
    if (open) {
      setSelected(new Set(controlledSelected));
      refetch();
    }
  }, [open, controlledSelected, refetch]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  async function handleFiles(files: FileList | File[]) {
    if (!activeStoreId) return;

    const fileArray = Array.from(files).filter((f) =>
      accept === "images" ? f.type.startsWith("image/") : true,
    );
    if (!fileArray.length) return;

    setUploading(true);
    const progMap: Record<string, "pending" | "done" | "error"> = {};
    fileArray.forEach((f) => (progMap[f.name] = "pending"));
    setUploadProgress({ ...progMap });

    let uploads: Array<{ key: string; uploadUrl: string; publicUrl: string }>;

    try {
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          storeId: activeStoreId,
          files: fileArray.map((f) => ({
            fileName: f.name,
            mimeType: f.type,
          })),
        }),
      });

      const data = await res.json();
      uploads = data.uploads;
    } catch {
      fileArray.forEach((f) => (progMap[f.name] = "error"));
      setUploadProgress({ ...progMap });
      setUploading(false);
      return;
    }

    const newItems: MediaItem[] = [];

    await Promise.all(
      fileArray.map(async (file, i) => {
        const { key, uploadUrl, publicUrl } = uploads[i];

        try {
          await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          const finalRes = await fetch("/api/media/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyId,
              storeId: activeStoreId,
              key,
              url: publicUrl,
              fileName: file.name,
              mimeType: file.type,
            }),
          });

          const created: MediaItem = await finalRes.json();
          newItems.push(created);
          progMap[file.name] = "done";
        } catch {
          progMap[file.name] = "error";
        }

        setUploadProgress({ ...progMap });
      }),
    );

    if (newItems.length) {
      setSelected((prev) => {
        const next = multiple ? new Set(prev) : new Set<string>();
        newItems.forEach((m) => next.add(m.id));
        return next;
      });
      setActiveTab("library");
      refetch();
    }

    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;

    setDeleting(id);
    try {
      await fetch(`/api/media/${id}?companyId=${companyId}`, {
        method: "DELETE",
      });

      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      refetch();
    } finally {
      setDeleting(null);
    }
  }

  function confirmSelection() {
    const picked = items.filter((m) => selected.has(m.id));
    onSelect(picked);
    onClose();
  }

  const filtered =
    accept === "images" ? items.filter((m) => isImage(m.mimeType)) : items;

  const firstSelected = filtered.find((m) => selected.has(m.id));

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-background-primary, #fff)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
          width: "min(960px, 96vw)",
          height: "min(680px, 92vh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderBottom: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>
            Media library
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            {(["library", "upload"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "0.5px solid",
                  borderColor:
                    activeTab === tab
                      ? "var(--color-border-primary, #999)"
                      : "transparent",
                  background:
                    activeTab === tab
                      ? "var(--color-background-secondary, #f5f5f5)"
                      : "transparent",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--color-text-primary)",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: "var(--color-text-secondary)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {activeTab === "library" ? (
              <>
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom:
                      "0.5px solid var(--color-border-tertiary, #e5e5e5)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--color-background-secondary, #f5f5f5)",
                      borderRadius: 8,
                      padding: "7px 12px",
                    }}
                  >
                    <Search
                      size={14}
                      style={{
                        color: "var(--color-text-secondary)",
                        flexShrink: 0,
                      }}
                    />
                    <input
                      placeholder="Search files…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        border: "none",
                        background: "none",
                        outline: "none",
                        fontSize: 13,
                        flex: 1,
                        color: "var(--color-text-primary)",
                      }}
                    />
                    {isLoading && (
                      <Loader2
                        size={14}
                        style={{
                          color: "var(--color-text-secondary)",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                  {filtered.length === 0 && !isLoading ? (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 8,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Image size={32} />
                      <p style={{ fontSize: 13, margin: 0 }}>No files found</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {filtered.map((item) => {
                        const isSelected = selected.has(item.id);
                        const isImg = isImage(item.mimeType);

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggle(item.id)}
                            className="media-tile"
                            style={{
                              position: "relative",
                              aspectRatio: "1",
                              borderRadius: 8,
                              border: isSelected
                                ? "2px solid #2563eb"
                                : "0.5px solid var(--color-border-tertiary, #e5e5e5)",
                              overflow: "hidden",
                              cursor: "pointer",
                              background:
                                "var(--color-background-secondary, #f5f5f5)",
                            }}
                          >
                            {isImg ? (
                              <img
                                src={item.url}
                                alt={item.fileName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexDirection: "column",
                                  gap: 4,
                                  padding: 8,
                                }}
                              >
                                <File
                                  size={24}
                                  style={{
                                    color: "var(--color-text-secondary)",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--color-text-secondary)",
                                    textAlign: "center",
                                    wordBreak: "break-all",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {item.fileName.slice(0, 20)}
                                </span>
                              </div>
                            )}

                            {isSelected && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 5,
                                  right: 5,
                                  width: 20,
                                  height: 20,
                                  borderRadius: "50%",
                                  background: "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Check size={12} color="#fff" strokeWidth={3} />
                              </div>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="delete-btn"
                              style={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: 4,
                                background: "rgba(0,0,0,0.55)",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              {deleting === item.id ? (
                                <Loader2
                                  size={11}
                                  color="#fff"
                                  style={{
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Trash2 size={11} color="#fff" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 32,
                  gap: 20,
                }}
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? "#2563eb" : "var(--color-border-secondary, #ccc)"}`,
                    borderRadius: 12,
                    padding: "48px 32px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    width: "100%",
                    maxWidth: 400,
                    background: dragOver
                      ? "rgba(37,99,235,0.04)"
                      : "var(--color-background-secondary, #f9f9f9)",
                  }}
                >
                  <Upload
                    size={32}
                    style={{
                      color: dragOver
                        ? "#2563eb"
                        : "var(--color-text-secondary)",
                      marginBottom: 12,
                    }}
                  />
                  <p
                    style={{ fontWeight: 500, fontSize: 14, margin: "0 0 4px" }}
                  >
                    Drop files here or click to browse
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    {accept === "images"
                      ? "PNG, JPG, GIF, WebP, SVG"
                      : "Any file type"}
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={accept === "images" ? "image/*" : undefined}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    e.target.files && handleFiles(e.target.files)
                  }
                />

                {Object.keys(uploadProgress).length > 0 && (
                  <div style={{ width: "100%", maxWidth: 400 }}>
                    {Object.entries(uploadProgress).map(([name, status]) => (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 0",
                          borderBottom:
                            "0.5px solid var(--color-border-tertiary, #eee)",
                          fontSize: 13,
                        }}
                      >
                        {status === "pending" && (
                          <Loader2
                            size={14}
                            style={{
                              flexShrink: 0,
                              animation: "spin 1s linear infinite",
                              color: "#2563eb",
                            }}
                          />
                        )}
                        {status === "done" && (
                          <Check
                            size={14}
                            style={{ color: "#16a34a", flexShrink: 0 }}
                          />
                        )}
                        {status === "error" && (
                          <X
                            size={14}
                            style={{ color: "#dc2626", flexShrink: 0 }}
                          />
                        )}
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              width: 220,
              flexShrink: 0,
              borderLeft: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              overflowY: "auto",
            }}
          >
            {firstSelected ? (
              <>
                {isImage(firstSelected.mimeType) ? (
                  <img
                    src={firstSelected.url}
                    alt={firstSelected.fileName}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      objectFit: "contain",
                      borderRadius: 8,
                      border:
                        "0.5px solid var(--color-border-tertiary, #e5e5e5)",
                      background: "var(--color-background-secondary)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border:
                        "0.5px solid var(--color-border-tertiary, #e5e5e5)",
                      background: "var(--color-background-secondary)",
                    }}
                  >
                    <File
                      size={36}
                      style={{ color: "var(--color-text-secondary)" }}
                    />
                  </div>
                )}

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(
                    [
                      ["Name", firstSelected.fileName],
                      ["Type", firstSelected.mimeType],
                      ...(firstSelected.size
                        ? [["Size", formatBytes(firstSelected.size)]]
                        : []),
                      [
                        "Date",
                        new Date(firstSelected.createdAt).toLocaleDateString(),
                      ],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div key={label}>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-secondary)",
                          margin: "0 0 2px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          margin: 0,
                          wordBreak: "break-all",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {selected.size > 1 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    +{selected.size - 1} more selected
                  </p>
                )}
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                  color: "var(--color-text-secondary)",
                }}
              >
                <Image size={28} />
                <p style={{ fontSize: 12, margin: 0, textAlign: "center" }}>
                  Select a file to see details
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 20px",
            borderTop: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-secondary, #ccc)",
              background: "transparent",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--color-text-primary)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={confirmSelection}
            disabled={selected.size === 0}
            style={{
              padding: "7px 20px",
              borderRadius: 8,
              border: "none",
              background: selected.size === 0 ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: selected.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {selected.size === 0
              ? "Select"
              : `Select ${selected.size} file${selected.size > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .delete-btn { opacity: 0 !important; }
        .media-tile:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
