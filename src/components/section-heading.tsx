type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <span className="eyebrow">{eyebrow}</span>
      <div className="space-y-3">
        <h2 className="display-heading text-3xl font-semibold leading-tight text-[var(--ink)] md:text-5xl">
          {title}
        </h2>
        <p className="text-base leading-7 text-[var(--muted)] md:text-lg">{description}</p>
      </div>
    </div>
  );
}