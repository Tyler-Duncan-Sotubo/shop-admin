"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { computeSeoScore, DEFAULT_SEO_STANDARDS } from "../lib/seo-score";

type SeoScoreCardProps = {
  focusKeyword?: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  contentHtml: string;
  className?: string;
};

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Ok";
  return "Needs work";
}

export function SeoScoreCard(props: SeoScoreCardProps) {
  const result = React.useMemo(
    () =>
      computeSeoScore({
        focusKeyword: props.focusKeyword,
        title: props.seoTitle,
        description: props.seoDescription,
        slug: props.slug,
        contentHtml: props.contentHtml,
        standards: DEFAULT_SEO_STANDARDS,
      }),
    [
      props.focusKeyword,
      props.seoTitle,
      props.seoDescription,
      props.slug,
      props.contentHtml,
    ]
  );

  return (
    <div className={cn("space-y-4", props.className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">SEO Score</div>
          <div className="text-xs text-muted-foreground">
            {scoreLabel(result.score)} • {result.counters.wordCount} words
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={result.score >= 60 ? "default" : "destructive"}>
            {result.score}/100
          </Badge>
        </div>
      </div>

      <Progress value={result.score} />

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border p-2">
          <div className="text-muted-foreground">Title</div>
          <div className="font-medium tabular-nums">
            {result.counters.titleLength} chars{" "}
            <span
              className={cn(
                result.ranges.title === "good" && "text-green-600",
                result.ranges.title === "short" && "text-amber-600",
                result.ranges.title === "long" && "text-amber-600",
                result.ranges.title === "too_long" && "text-red-600"
              )}
            >
              ({result.ranges.title})
            </span>
          </div>
        </div>

        <div className="rounded-md border p-2">
          <div className="text-muted-foreground">Description</div>
          <div className="font-medium tabular-nums">
            {result.counters.descriptionLength} chars{" "}
            <span
              className={cn(
                result.ranges.description === "good" && "text-green-600",
                result.ranges.description === "short" && "text-amber-600",
                result.ranges.description === "long" && "text-amber-600",
                result.ranges.description === "too_long" && "text-red-600"
              )}
            >
              ({result.ranges.description})
            </span>
          </div>
        </div>

        <div className="rounded-md border p-2">
          <div className="text-muted-foreground">Permalink</div>
          <div className="font-medium tabular-nums">
            {result.counters.slugLength} chars{" "}
            <span
              className={cn(
                result.ranges.slug === "good" && "text-green-600",
                result.ranges.slug === "short" && "text-green-600",
                result.ranges.slug === "long" && "text-amber-600",
                result.ranges.slug === "too_long" && "text-red-600"
              )}
            >
              ({result.ranges.slug})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.checks.map((c) => (
          <div key={c.key} className="flex items-start justify-between gap-3">
            <div className="text-sm">
              <div className="font-medium">{c.label}</div>
              {c.hint ? (
                <div className="text-xs text-muted-foreground">{c.hint}</div>
              ) : null}
            </div>

            <Badge
              variant={
                c.ok
                  ? "default"
                  : c.severity === "warn"
                  ? "destructive"
                  : "secondary"
              }
            >
              {c.ok ? "Pass" : "Needs"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
