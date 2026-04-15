const levelLabels: Record<string, string> = {
  enthusiast: "Community member",
  contributor: "Active contributor",
  expert: "Verified editor",
  authority: "Community authority",
  legend: "Platform legend",
};

interface ExpertiseSectionProps {
  passionPoints: {
    site_name: string;
    level: string;
    points: number;
  }[];
}

export function ExpertiseSection({ passionPoints }: ExpertiseSectionProps) {
  const withPoints = passionPoints.filter((p) => p.points > 0);
  if (withPoints.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Platform expertise
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {withPoints.map((p) => (
          <div
            key={p.site_name}
            className="rounded-xl py-4 px-5"
            style={{ backgroundColor: "#F8FAFC", borderLeft: "3px solid #0C447C" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#0C447C" }}>
              {p.site_name}.fan
            </p>
            <p className="text-[14px] font-semibold text-[#0A1628] mt-1">
              {levelLabels[p.level] ?? p.level}
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {p.points.toLocaleString()} passion points
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
