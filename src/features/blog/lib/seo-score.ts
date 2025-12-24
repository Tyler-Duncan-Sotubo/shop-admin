export type SeoLengthRange = {
  min: number; // "good" min
  max: number; // "good" max
  hardMax: number; // backend should enforce this
};

export type SeoStandards = {
  title: SeoLengthRange;
  description: SeoLengthRange;
  slug: SeoLengthRange; // slug doesn't really have a "min", but we use 1
  recommendedMinWords: number; // e.g. 600
  keywordBeginningChars: number; // e.g. first 150 chars of content
};

export type SeoCheckSeverity = "info" | "warn";

export type SeoCheck = {
  key: string;
  label: string;
  ok: boolean;
  severity: SeoCheckSeverity;
  hint?: string;
  weight: number; // points contributed to score
};

export type SeoScoreResult = {
  score: number; // 0..100
  checks: SeoCheck[];

  counters: {
    titleLength: number;
    descriptionLength: number;
    slugLength: number;
    wordCount: number;
  };

  ranges: {
    title: "good" | "short" | "long" | "too_long";
    description: "good" | "short" | "long" | "too_long";
    slug: "good" | "short" | "long" | "too_long";
  };
};

export const DEFAULT_SEO_STANDARDS: SeoStandards = {
  // RankMath-ish defaults
  title: { min: 30, max: 60, hardMax: 70 },
  description: { min: 120, max: 160, hardMax: 160 },
  slug: { min: 1, max: 75, hardMax: 240 },

  recommendedMinWords: 600,
  keywordBeginningChars: 150,
};

function stripHtml(html: string) {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(s: string) {
  return (s || "").toLowerCase().trim();
}

function containsKeyword(haystack: string, keyword: string) {
  const h = normalize(haystack);
  const k = normalize(keyword);
  if (!k) return false;
  return h.includes(k);
}

function lengthStatus(
  len: number,
  range: SeoLengthRange
): "good" | "short" | "long" | "too_long" {
  if (len === 0) return "short";
  if (len > range.hardMax) return "too_long";
  if (len < range.min) return "short";
  if (len > range.max) return "long";
  return "good";
}

function wordCountFromText(text: string) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Compute RankMath-like SEO score checks for blog posts
 */
export function computeSeoScore(input: {
  focusKeyword?: string;
  title: string; // seo title (or post title if you want)
  description: string; // seo meta description
  slug: string; // permalink slug
  contentHtml: string;
  standards?: Partial<SeoStandards>;
}): SeoScoreResult {
  const standards: SeoStandards = {
    ...DEFAULT_SEO_STANDARDS,
    ...(input.standards ?? {}),
    title: {
      ...DEFAULT_SEO_STANDARDS.title,
      ...(input.standards?.title ?? {}),
    },
    description: {
      ...DEFAULT_SEO_STANDARDS.description,
      ...(input.standards?.description ?? {}),
    },
    slug: { ...DEFAULT_SEO_STANDARDS.slug, ...(input.standards?.slug ?? {}) },
  };

  const focusKeyword = (input.focusKeyword ?? "").trim();

  const titleLen = (input.title ?? "").trim().length;
  const descLen = (input.description ?? "").trim().length;
  const slugLen = (input.slug ?? "").trim().length;

  const text = stripHtml(input.contentHtml ?? "");
  const words = wordCountFromText(text);

  const titleRange = lengthStatus(titleLen, standards.title);
  const descRange = lengthStatus(descLen, standards.description);
  const slugRange = lengthStatus(slugLen, standards.slug);

  const beginning = text.slice(0, standards.keywordBeginningChars);

  // --- checks (weights tuned for a simple 0..100 score)
  const checks: SeoCheck[] = [
    {
      key: "kw_set",
      label: "Focus Keyword is set",
      ok: !!focusKeyword,
      severity: "warn",
      hint: "Add a focus keyword to get SEO scoring.",
      weight: 10,
    },

    {
      key: "kw_in_title",
      label: "Add Focus Keyword to the SEO title",
      ok: !!focusKeyword && containsKeyword(input.title, focusKeyword),
      severity: "warn",
      hint: "Include your focus keyword in the SEO title.",
      weight: 10,
    },
    {
      key: "kw_in_description",
      label: "Add Focus Keyword to your SEO Meta Description",
      ok: !!focusKeyword && containsKeyword(input.description, focusKeyword),
      severity: "warn",
      hint: "Include your focus keyword in the meta description.",
      weight: 10,
    },
    {
      key: "kw_in_url",
      label: "Use Focus Keyword in the URL",
      ok: !!focusKeyword && containsKeyword(input.slug, focusKeyword),
      severity: "warn",
      hint: "Your slug should contain the focus keyword (or close variation).",
      weight: 10,
    },
    {
      key: "kw_at_start",
      label: "Use Focus Keyword at the beginning of your content",
      ok: !!focusKeyword && containsKeyword(beginning, focusKeyword),
      severity: "info",
      hint: `Try to mention the keyword within the first ${standards.keywordBeginningChars} characters.`,
      weight: 10,
    },
    {
      key: "kw_in_content",
      label: "Use Focus Keyword in the content",
      ok: !!focusKeyword && containsKeyword(text, focusKeyword),
      severity: "warn",
      hint: "Mention your focus keyword at least once in the content.",
      weight: 10,
    },

    {
      key: "word_count",
      label: `Content length is at least ${standards.recommendedMinWords} words`,
      ok: words >= standards.recommendedMinWords,
      severity: "info",
      hint:
        words === 0
          ? "Add content to improve SEO and readability."
          : `Content is ${words} words long. Consider using at least ${standards.recommendedMinWords} words.`,
      weight: 10,
    },

    {
      key: "title_length",
      label: `SEO title length is ${standards.title.min}-${standards.title.max} chars (max ${standards.title.hardMax})`,
      ok: titleRange === "good",
      severity: titleRange === "too_long" ? "warn" : "info",
      hint:
        titleRange === "short"
          ? "Title is too short."
          : titleRange === "long"
          ? "Title is a bit long. Try shortening."
          : titleRange === "too_long"
          ? `Title is above hard max (${standards.title.hardMax}).`
          : undefined,
      weight: 10,
    },

    {
      key: "desc_length",
      label: `Meta description length is ${standards.description.min}-${standards.description.max} chars (max ${standards.description.hardMax})`,
      ok: descRange === "good",
      severity: descRange === "too_long" ? "warn" : "info",
      hint:
        descRange === "short"
          ? "Description is too short."
          : descRange === "long"
          ? "Description is a bit long. Try shortening."
          : descRange === "too_long"
          ? `Description is above hard max (${standards.description.hardMax}).`
          : undefined,
      weight: 10,
    },

    {
      key: "slug_length",
      label: `Permalink length is under ${standards.slug.max} chars (max ${standards.slug.hardMax})`,
      ok: slugRange === "good" || slugRange === "short",
      severity: slugRange === "too_long" ? "warn" : "info",
      hint:
        slugRange === "too_long"
          ? `Slug is above hard max (${standards.slug.hardMax}).`
          : slugRange === "long"
          ? "Slug is long; consider shortening."
          : undefined,
      weight: 10,
    },
  ];

  // scoring: only count checks that are applicable (if keyword not set, kw checks still exist but will fail)
  const totalPossible = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);

  const score =
    totalPossible === 0 ? 0 : Math.round((earned / totalPossible) * 100);

  return {
    score,
    checks,
    counters: {
      titleLength: titleLen,
      descriptionLength: descLen,
      slugLength: slugLen,
      wordCount: words,
    },
    ranges: {
      title: titleRange,
      description: descRange,
      slug: slugRange,
    },
  };
}
