import { formatFollowerCount } from "./SocialIcons";

interface StatsBarProps {
  totalReach: number;
  fanClubCount: number;
  communityCount: number;
  brandCollabCount: number;
}

export function StatsBar({ totalReach, fanClubCount, communityCount, brandCollabCount }: StatsBarProps) {
  const stats = [
    { label: "Total reach", value: formatFollowerCount(totalReach) },
    { label: "Fan clubs", value: fanClubCount.toString() },
    { label: "Communities", value: communityCount.toString() },
    { label: "Brand collabs", value: brandCollabCount.toString() },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center rounded-xl py-4"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <span className="text-[20px] font-bold text-[#0A1628]">{s.value}</span>
          <span className="text-[11px] text-gray-400 mt-0.5">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
