interface BrandCollab {
  id: string;
  brand_name: string;
  role: string | null;
  year: number | null;
  reach: number | null;
  engagement_rate: number | null;
  post_count: number | null;
  site_id: string | null;
  site_name: string | null;
}

function brandColor(name: string): string {
  const colors = ["#0C447C", "#065F46", "#92400E", "#7C3AED", "#B91C1C", "#0369A1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function BrandCollabsSection({ brandCollabs }: { brandCollabs: BrandCollab[] }) {
  if (brandCollabs.length === 0) return null;

  const visible = brandCollabs.slice(0, 3);
  const remaining = brandCollabs.length - 3;

  return (
    <section className="py-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Brand collaborations
      </h2>
      <div className="space-y-3">
        {visible.map((c) => (
          <div key={c.id} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white border border-gray-100">
            {/* Brand logo placeholder */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[13px] font-bold shrink-0"
              style={{ backgroundColor: brandColor(c.brand_name) }}
            >
              {c.brand_name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0A1628] truncate">
                {c.brand_name}
              </p>
              <p className="text-[12px] text-gray-400">
                {[c.role, c.year].filter(Boolean).join(" · ")}
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-gray-400 shrink-0">
              {c.reach != null && <span>{(c.reach / 1000).toFixed(0)}K reach</span>}
              {c.engagement_rate != null && <span>{c.engagement_rate}%</span>}
              {c.post_count != null && <span>{c.post_count} posts</span>}
            </div>

            {c.site_name && (
              <a href={`https://${c.site_name}.fan`} className="text-[12px] font-medium shrink-0" style={{ color: "#0C447C" }}>
                View on {c.site_name}.fan →
              </a>
            )}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <p className="text-[13px] font-medium mt-3" style={{ color: "#0C447C" }}>
          View all {brandCollabs.length} collaborations →
        </p>
      )}
    </section>
  );
}
