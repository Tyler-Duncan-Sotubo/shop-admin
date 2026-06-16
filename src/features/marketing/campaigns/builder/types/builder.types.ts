export type Step = 1 | 2 | 3 | 4 | 5;

export const STEPS = [
  { id: 1 as Step, label: "Template" },
  { id: 2 as Step, label: "Content" },
  { id: 3 as Step, label: "Preview" },
  { id: 4 as Step, label: "Audience" },
  { id: 5 as Step, label: "Send" },
] as const;
