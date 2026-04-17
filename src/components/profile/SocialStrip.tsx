import { getSocialIcon, formatFollowerCount, TobeFanIcon } from "./SocialIcons";

interface SocialStripProps {
  socialLinks: {
    platform: string;
    handle: string | null;
    follower_count: number;
    display_order: number;
  }[];
  fanCount: number;
}

export function SocialStrip({ socialLinks, fanCount }: SocialStripProps) {
  if (socialLinks.length === 0 && fanCount === 0) {
    return (
      <section className="py-8">
        <a href="/settings" className="text-[13px] text-gray-400 italic hover:text-[#0C447C] transition-colors">
          Connect your social accounts to show your reach →
        </a>
      </section>
    );
  }

  // tobe.fan card first, then by display_order
  const sorted = [...socialLinks].sort((a, b) => a.display_order - b.display_order);

  return (
    <section className="py-8">
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {/* tobe.fan card always first */}
        <SocialCard platform="tobe.fan" count={fanCount} handle={null} />
        {sorted.map((link) => (
          <SocialCard
            key={link.platform}
            platform={link.platform}
            count={link.follower_count}
            handle={link.handle}
          />
        ))}
      </div>
    </section>
  );
}

function SocialCard({
  platform,
  count,
  handle,
}: {
  platform: string;
  count: number;
  handle: string | null;
}) {
  const IconComponent = getSocialIcon(platform);

  return (
    <div className="flex flex-col items-center justify-center w-[100px] h-[100px] rounded-xl border-2 border-[#0A1628]">
      <div className="text-[#0A1628]">
        {IconComponent ? <IconComponent size={22} /> : <TobeFanIcon size={22} />}
      </div>
      {count > 0 && (
        <span className="text-[14px] font-bold text-[#0A1628] mt-1.5">
          {formatFollowerCount(count)}
        </span>
      )}
      <span className="text-[10px] text-gray-400 mt-0.5 capitalize">
        {platform}
      </span>
    </div>
  );
}
