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

import { useDropzone } from "react-dropzone";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { UploadCloud, X, ImageIcon } from "lucide-react";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  uploadEndpoint?: string; // e.g. "/api/media/editor-image"
  maxCharacters?: number;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadDialog({
  open,
  onOpenChange,
  onUploaded,
  uploadEndpoint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: (url: string) => void;
  uploadEndpoint: string;
}) {
  const axios = useAxiosAuth();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const onDrop = React.useCallback(async (accepted: File[]) => {
    const file = accepted?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setPreview(base64);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const reset = () => {
    setPreview(null);
    setUploading(false);
  };

  const upload = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      const res = await axios.post(uploadEndpoint, { base64: preview });
      const url = res.data?.url ?? res.data?.data?.url;
      if (!url) throw new Error("Upload failed: no url returned");

      onUploaded(url);
      onOpenChange(false);
      reset();
    } catch (e) {
      console.error(e);
      alert("Image upload failed");
      setUploading(false);
    }
  };

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
              isDragActive && "border-primary"
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
                <div className="mt-3 flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="clean"
                    onClick={() => setPreview(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button type="button" onClick={upload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload & insert"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-6 w-6" />
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
  uploadEndpoint = "/api/media/editor-image",
  maxCharacters = 20000,
}: TiptapEditorProps) {
  const axios = useAxiosAuth();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [uploading, setUploading] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const uploadImageToS3 = React.useCallback(
    async (base64: string) => {
      const res = await axios.post(uploadEndpoint, { base64 });
      const url = res.data?.url ?? res.data?.data?.url;
      if (!url) throw new Error("Upload failed: no url returned");
      return url as string;
    },
    [axios, uploadEndpoint]
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
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[260px] px-3 py-3",
      },

      // paste image -> upload -> insert
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const items = Array.from(clipboard.items || []);
        const imageItem = items.find(
          (i) => i.kind === "file" && i.type.startsWith("image/")
        );
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;

        event.preventDefault();
        (async () => {
          try {
            setUploading(true);
            const base64 = await fileToBase64(file);
            const url = await uploadImageToS3(base64);

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

      // drop image -> upload -> insert
      handleDrop: (view, event) => {
        const dt = event.dataTransfer;
        if (!dt?.files?.length) return false;

        const file = Array.from(dt.files).find(isImageFile);
        if (!file) return false;

        event.preventDefault();
        (async () => {
          try {
            setUploading(true);
            const base64 = await fileToBase64(file);
            const url = await uploadImageToS3(base64);

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

  return (
    <div className={cn("rounded-lg border", className)}>
      <ImageUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        uploadEndpoint={uploadEndpoint}
        onUploaded={(url) =>
          editor.chain().focus().setImage({ src: url }).run()
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
        >
          B
        </Button>
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
        >
          I
        </Button>
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive("strike") && "bg-muted")}
        >
          S
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
        >
          H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(editor.isActive("heading", { level: 3 }) && "bg-muted")}
        >
          H3
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(editor.isActive("blockquote") && "bg-muted")}
        >
          Quote
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive("codeBlock") && "bg-muted")}
        >
          Code
        </Button>

        <span className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={setLink}
          className={cn(editor.isActive("link") && "bg-muted")}
        >
          Link
        </Button>

        {/* ✅ This now opens the upload modal */}
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => setUploadOpen(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Image
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {uploading ? (
            <span className="text-xs text-muted-foreground">Uploading…</span>
          ) : null}

          <span
            className={cn(
              "text-xs tabular-nums",
              overLimit ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {words} words • {chars}/{maxCharacters} chars
          </span>

          <Button
            type="button"
            size="sm"
            variant="clean"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            Undo
          </Button>
          <Button
            type="button"
            size="sm"
            variant="clean"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            Redo
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
