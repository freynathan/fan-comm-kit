import { UserCircle, Compass, Link as LinkIcon } from "lucide-react";
import type { OnboardingData } from "./OnboardingFlow";

interface Props {
  data: OnboardingData;
  onComplete: () => void;
}

export function Step4Welcome({ data, onComplete }: Props) {
  const firstName = data.displayName?.split(" ")[0] || data.username || "friend";
  const firstSite = data.selectedSites[0];

  const cards = [
    {
      icon: UserCircle,
      title: "Visit your profile",
      desc: `See your tobe.fan/of/${data.username} page live`,
      href: `/of/${data.username}`,
    },
    firstSite
      ? {
          icon: Compass,
          title: `Explore ${firstSite.name}.fan`,
          desc: `Join the conversation on ${firstSite.name}.fan`,
          href: `/${firstSite.name}`,
        }
      : null,
    {
      icon: LinkIcon,
      title: "Add your social links",
      desc: "Show your YouTube, Instagram, TikTok and follower counts",
      href: "/my/settings#social",
    },
  ].filter(Boolean) as { icon: any; title: string; desc: string; href: string }[];

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0A1628" }}>
        Welcome to tobe.fan, {firstName}.
      </h1>
      <p className="mt-3 text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: "#6b7280" }}>
        Come for the passion. Relate with fellow fans.
        <br />
        Convert your social clout into passive income, forever.
      </p>

      {/* Next-step cards */}
      <div className="mt-10 space-y-4 max-w-md mx-auto">
        {cards.map((card) => (
          <a
            key={card.title}
            href={card.href}
            onClick={(e) => {
              e.preventDefault();
              onComplete();
            }}
            className="flex items-center gap-4 rounded-xl border border-gray-100 p-5 text-left transition-all hover:shadow-md hover:border-gray-200 cursor-pointer"
            style={{ borderTop: "3px solid #0C447C" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#E6F1FB" }}
            >
              <card.icon size={20} style={{ color: "#0C447C" }} />
            </div>
            <div>
              <div className="text-[14px] font-semibold" style={{ color: "#0A1628" }}>
                {card.title}
              </div>
              <div className="text-[13px] mt-0.5" style={{ color: "#6b7280" }}>
                {card.desc}
              </div>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-8 text-[13px]" style={{ color: "#9ca3af" }}>
        Or{" "}
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            onComplete();
          }}
          className="underline"
          style={{ color: "#0C447C" }}
        >
          go to your dashboard to manage everything →
        </a>
      </p>
    </div>
  );
}
