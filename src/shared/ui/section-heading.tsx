import { P } from "@/shared/ui/typography";

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <P className="mb-2 font-bold">{children}</P>
      <div className="h-px w-full bg-border" />
    </div>
  );
}
