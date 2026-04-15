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
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
        Passions
      </h2>
      <div className="flex flex-wrap gap-2">
        {passionPoints.map((p) => (
          <span
            key={p.site_name}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium bg-gray-100 text-gray-700"
          >
            {p.site_emoji} {p.site_name}
          </span>
        ))}
      </div>
    </section>
  );
}
