// src/shared/ui/typography.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────
 * Headings
 * ────────────────────────────*/

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

export const H1: React.FC<HeadingProps> = ({ className, ...props }) => (
  <h1
    className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      className
    )}
    {...props}
  />
);

export const H2: React.FC<HeadingProps> = ({ className, ...props }) => (
  <h2
    className={cn(
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      className
    )}
    {...props}
  />
);

export const H3: React.FC<HeadingProps> = ({ className, ...props }) => (
  <h3
    className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-tight",
      className
    )}
    {...props}
  />
);

export const H4: React.FC<HeadingProps> = ({ className, ...props }) => (
  <h4
    className={cn(
      "scroll-m-20 text-xl font-semibold tracking-tight",
      className
    )}
    {...props}
  />
);

/* ─────────────────────────────
 * Paragraphs & variants
 * ────────────────────────────*/

export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

export const P: React.FC<ParagraphProps> = ({ className, ...props }) => (
  <p className={cn("leading-7 not-first:mt-4", className)} {...props} />
);

// Larger intro text, useful at top of pages
export const Lead: React.FC<ParagraphProps> = ({ className, ...props }) => (
  <p className={cn("text-xl text-muted-foreground", className)} {...props} />
);

// Small / fine print
export const Small: React.FC<ParagraphProps> = ({ className, ...props }) => (
  <p className={cn("text-sm font-medium leading-none", className)} {...props} />
);

// Subtle / secondary text
export const Muted: React.FC<ParagraphProps> = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

/* ─────────────────────────────
 * Blockquote
 * ────────────────────────────*/

export type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;

export const Blockquote: React.FC<BlockquoteProps> = ({
  className,
  ...props
}) => (
  <blockquote
    className={cn(
      "mt-6 border-l-2 pl-6 italic text-muted-foreground",
      className
    )}
    {...props}
  />
);

/* ─────────────────────────────
 * Lists
 * ────────────────────────────*/

export type ListProps = React.HTMLAttributes<HTMLUListElement>;

export const Ul: React.FC<ListProps> = ({ className, ...props }) => (
  <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
);

export type OlProps = React.OlHTMLAttributes<HTMLOListElement>;

export const Ol: React.FC<OlProps> = ({ className, ...props }) => (
  <ol
    className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
    {...props}
  />
);

export type LiProps = React.LiHTMLAttributes<HTMLLIElement>;

export const Li: React.FC<LiProps> = ({ className, ...props }) => (
  <li className={cn("leading-7", className)} {...props} />
);

/* ─────────────────────────────
 * Inline code
 * ────────────────────────────*/

export type InlineCodeProps = React.HTMLAttributes<HTMLElement>;

export const InlineCode: React.FC<InlineCodeProps> = ({
  className,
  ...props
}) => (
  <code
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      className
    )}
    {...props}
  />
);

/* ─────────────────────────────
 * Helper: Typography container
 * ────────────────────────────*/

export type ProseProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Optional wrapper for long-form content.
 * You can layer `prose` here if you use @tailwindcss/typography.
 */
export const Prose: React.FC<ProseProps> = ({ className, ...props }) => (
  <div className={cn("space-y-4", className)} {...props} />
);
