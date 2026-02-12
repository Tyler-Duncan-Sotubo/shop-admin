"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaLink,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaHeading,
  FaListUl,
  FaListOl,
  FaCode,
  FaImage,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  maxCharacters?: number;
};

type PresignResp = {
  uploads: Array<{ key: string; uploadUrl: string; url: string }>;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function sanitizeFileName(name: string) {
  return (name || "upload")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}

async function putToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`S3 upload failed (${res.status}) ${text}`);
  }
}

function ImageUploadDialog({
  open,
  onOpenChange,
  onUploaded,
  uploadFile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: (url: string) => void;
  uploadFile: (file: File) => Promise<string>;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const onDrop = React.useCallback((accepted: File[]) => {
    const f = accepted?.[0];
    if (!f) return;

    setFile(f);
    const blobUrl = URL.createObjectURL(f);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return blobUrl;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const reset = React.useCallback(() => {
    setFile(null);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setUploading(false);
  }, []);

  const upload = React.useCallback(async () => {
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadFile(file);
      onUploaded(url);
      onOpenChange(false);
      reset();
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  }, [file, uploadFile, onUploaded, onOpenChange, reset]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border rounded-lg w-full flex flex-col items-center justify-center p-6",
              "border-dashed cursor-pointer hover:border-primary",
              isDragActive && "border-primary",
            )}
          >
            <input {...getInputProps()} />

            {preview ? (
              <div className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-60 object-contain rounded-md border"
                />
                <div
                  className="mt-3 flex justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="clean"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    <FaTimes className="h-4 w-4 mr-2" />
                    Remove
                  </Button>

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      upload();
                    }}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload & insert"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FaCloudUploadAlt className="h-6 w-6" />
                <p className="text-sm">
                  Drag & drop an image here or click to choose
                </p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Tip: you can also paste or drop images directly into the editor.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  maxCharacters = 20000,
}: TiptapEditorProps) {
  const { activeStoreId: storeId } = useStoreScope();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [uploading, setUploading] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  // ✅ same logic you shared: presign -> PUT -> finalize
  const uploadImageFile = React.useCallback(
    async (file: File) => {
      if (!storeId)
        throw new Error("Missing storeId (pass it into <TiptapEditor />)");

      const fileName = sanitizeFileName(
        file.name || `editor-${Date.now()}.png`,
      );
      const mimeType = file.type || "application/octet-stream";

      // 1) presign
      const presign = await axios.post<PresignResp>(
        "/api/uploads/media-presign",
        {
          storeId,
          folder: "editor",
          files: [{ fileName, mimeType }],
        },
      );

      const first = presign.data.uploads?.[0];
      if (!first) throw new Error("No presigned upload returned");

      // 2) PUT to S3
      await putToS3(first.uploadUrl, file);

      // 3) finalize
      await axios.post("/api/uploads/finalize", {
        storeId,
        key: first.key,
        url: first.url,
        fileName,
        mimeType,
        folder: "editor",
        tag: "tiptap-image",
      });

      return first.url;
    },
    [storeId],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, blockquote: false }),
      Blockquote,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      CharacterCount.configure({ limit: maxCharacters }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[260px] px-3 py-3",
      },

      // paste image -> presign -> put -> finalize -> insert
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const items = Array.from(clipboard.items || []);
        const imageItem = items.find(
          (i) => i.kind === "file" && i.type.startsWith("image/"),
        );
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        event.preventDefault();
        (async () => {
          try {
            setUploading(true);
            const url = await uploadImageFile(file);

            const { state, dispatch } = view;
            const node = state.schema.nodes.image.create({ src: url });
            dispatch(state.tr.replaceSelectionWith(node));
          } catch (e) {
            console.error(e);
            alert("Image upload failed");
          } finally {
            setUploading(false);
          }
        })();

        return true;
      },

      // drop image -> presign -> put -> finalize -> insert
      handleDrop: (view, event) => {
        const dt = event.dataTransfer;
        if (!dt?.files?.length) return false;

        const file = Array.from(dt.files).find(isImageFile);
        if (!file) return false;

        event.preventDefault();
        (async () => {
          try {
            setUploading(true);
            const url = await uploadImageFile(file);

            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            const pos = coords?.pos ?? view.state.selection.from;

            const node = view.state.schema.nodes.image.create({ src: url });
            view.dispatch(view.state.tr.insert(pos, node));
          } catch (e) {
            console.error(e);
            alert("Image upload failed");
          } finally {
            setUploading(false);
          }
        })();

        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // sync external value
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted) return null;
  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "");
    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const chars = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();
  const overLimit = chars > maxCharacters;

  const active = (isActive: boolean) => cn(isActive && "bg-muted");

  return (
    <div className={cn("rounded-lg border", className)}>
      {/* Dialog upload -> presign -> put -> finalize -> insert */}
      <ImageUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        uploadFile={uploadImageFile}
        onUploaded={(url) =>
          editor.chain().focus().setImage({ src: url }).run()
        }
      />

      <style jsx global>{`
        .tiptap-shell .ProseMirror ul {
          list-style: disc;
          padding-left: 1.25rem;
        }
        .tiptap-shell .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.25rem;
        }
        .tiptap-shell .ProseMirror li {
          margin: 0.25rem 0;
        }
        .tiptap-shell .ProseMirror h1 {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          margin: 0.75rem 0 0.5rem;
        }
        .tiptap-shell .ProseMirror h2 {
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 700;
          margin: 0.75rem 0 0.5rem;
        }
        .tiptap-shell .ProseMirror h3 {
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 700;
          margin: 0.75rem 0 0.5rem;
        }
        .tiptap-shell .ProseMirror blockquote {
          border-left: 3px solid rgba(0, 0, 0, 0.15);
          padding-left: 0.75rem;
          margin: 0.75rem 0;
          color: rgba(0, 0, 0, 0.75);
        }
        .tiptap-shell .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .tiptap-shell .ProseMirror a {
          text-decoration: underline;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={active(editor.isActive("bold"))}
        >
          <FaBold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={active(editor.isActive("italic"))}
        >
          <FaItalic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={active(editor.isActive("strike"))}
        >
          <FaStrikethrough className="h-4 w-4" />
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={active(editor.isActive("heading", { level: 1 }))}
        >
          <FaHeading className="h-4 w-4" />
          <span className="ml-1 text-xs">1</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={active(editor.isActive("heading", { level: 2 }))}
        >
          <FaHeading className="h-4 w-4" />
          <span className="ml-1 text-xs">2</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={active(editor.isActive("heading", { level: 3 }))}
        >
          <FaHeading className="h-4 w-4" />
          <span className="ml-1 text-xs">3</span>
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={active(editor.isActive("bulletList"))}
        >
          <FaListUl className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={active(editor.isActive("orderedList"))}
        >
          <FaListOl className="h-4 w-4" />
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={active(editor.isActive("blockquote"))}
        >
          <FaQuoteRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={active(editor.isActive("codeBlock"))}
        >
          <FaCode className="h-4 w-4" />
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Add/Edit link"
          onClick={setLink}
          className={active(editor.isActive("link"))}
        >
          <FaLink className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          title="Insert image"
          onClick={() => setUploadOpen(true)}
        >
          <FaImage className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-3">
          {uploading ? (
            <span className="text-xs text-muted-foreground">Uploading…</span>
          ) : null}

          <span
            className={cn(
              "text-xs tabular-nums",
              overLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {words} words • {chars}/{maxCharacters} chars
          </span>

          <Button
            type="button"
            size="sm"
            variant="clean"
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <FaUndo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="clean"
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <FaRedo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Typography wrapper */}
      <div className="tiptap-shell">
        <div className="prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
