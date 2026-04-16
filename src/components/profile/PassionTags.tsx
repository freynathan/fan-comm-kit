import { DomainButton } from "@/components/shared/DomainButton";

interface PassionTagsProps {
  passionPoints: {
    site_name: string;
    site_emoji: string;
    points: number;
  }[];
}

export function PassionTags({ passionPoints }: PassionTagsProps) {
  if (passionPoints.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-3">
        Passions
      </h2>
      <div className="flex flex-wrap gap-2">
        {passionPoints.map((p) => (
          <DomainButton
            key={p.site_name}
            siteName={p.site_name}
            domain={`${p.site_name.toLowerCase()}.fan`}
            size="small"
          />
        ))}
      </div>
    </section>
  );
}
