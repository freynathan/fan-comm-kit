interface StatPillsProps {
  totalFans: number;
  totalClubs: number;
  totalCommunities: number;
  postsToday: number;
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

export function StatPills({ totalFans, totalClubs, totalCommunities, postsToday }: StatPillsProps) {
  const items = [
    `${fmt(totalFans)} passionate fans`,
    `${fmt(totalClubs)} fan clubs`,
    `${totalCommunities} communities`,
    `${fmt(postsToday)} posts today`,
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map((text) => (
        <span
          key={text}
          className="inline-flex items-center px-[14px] py-[6px] rounded-full text-[13px] font-normal bg-ds-surface text-ds-text-secondary border border-ds-border"
          style={{ borderWidth: '0.5px' }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
