// shared/ui/tiptap-simple.tsx
"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo,
} from "react-icons/fa";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function TiptapSimple({
  value,
  onChange,
  placeholder = "Write something…",
  className,
}: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[120px] px-3 py-3 text-sm",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) return null;

  const active = (isActive: boolean) => cn(isActive && "bg-muted");

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

  return (
    <div className={cn("rounded-lg border", className)}>
      <style jsx global>{`
        .tiptap-simple .ProseMirror ul {
          list-style: disc;
          padding-left: 1.25rem;
        }
        .tiptap-simple .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.25rem;
        }
        .tiptap-simple .ProseMirror li {
          margin: 0.2rem 0;
        }
        .tiptap-simple .ProseMirror a {
          text-decoration: underline;
        }
        .tiptap-simple .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={active(editor.isActive("bold"))}
        >
          <FaBold className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={active(editor.isActive("italic"))}
        >
          <FaItalic className="h-3.5 w-3.5" />
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={active(editor.isActive("bulletList"))}
        >
          <FaListUl className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={active(editor.isActive("orderedList"))}
        >
          <FaListOl className="h-3.5 w-3.5" />
        </Button>

        <span className="mx-1 h-4 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant="clean"
          onClick={setLink}
          className={active(editor.isActive("link"))}
        >
          <FaLink className="h-3.5 w-3.5" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="clean"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <FaUndo className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="clean"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <FaRedo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="tiptap-simple">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
