import { Link } from "react-router-dom";
import { MapPin, Pencil } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    initials: string;
  };
  profile: {
    bio: string | null;
    headline: string | null;
    location: string | null;
    hire_available: boolean;
    verified: boolean;
  } | null;
  isOwner: boolean;
  badges: {
    verified: boolean;
    fanClubOwner: boolean;
    brandCollaborator: boolean;
    topContributor: boolean;
  };
}

const badgeConfig = [
  { key: "verified", label: "Verified editor", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { key: "fanClubOwner", label: "Fan club owner", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  { key: "brandCollaborator", label: "Brand collaborator", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { key: "aiReady", label: "AI Search Ready", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  { key: "topContributor", label: "Top contributor", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
] as const;

export function ProfileHeader({ user, profile, isOwner, badges }: ProfileHeaderProps) {
  const showBadges = {
    verified: badges.verified,
    fanClubOwner: badges.fanClubOwner,
    brandCollaborator: badges.brandCollaborator,
    aiReady: badges.verified,
    topContributor: badges.topContributor,
  };

  return (
    <section className="pt-10 pb-8 border-b border-gray-100">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name ?? user.username}
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: "3px solid #0C447C" }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: "#0C447C" }}
            >
              {user.initials || user.username.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-[22px] font-bold" style={{ color: "#0A1628" }}>
              {user.display_name ?? user.username}
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              tobe.fan/of/{user.username}
            </p>
            {profile?.location && (
              <p className="text-[13px] text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={12} /> {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              to="/profile/edit"
              className="h-9 px-4 rounded-lg text-[13px] font-medium border border-gray-200 text-gray-500 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} /> Edit profile
            </Link>
          )}
          {!isOwner && (
            <>
              <button className="h-9 px-4 rounded-lg text-[13px] font-medium border-2 transition-colors hover:bg-gray-50" style={{ borderColor: "#0A1628", color: "#0A1628" }}>
                Relate
              </button>
              <button className="h-9 px-4 rounded-lg text-[13px] font-medium border border-gray-300 text-gray-500 transition-colors hover:bg-gray-50">
                Follow
              </button>
              {profile?.hire_available && (
                <button className="h-9 px-4 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#0C447C" }}>
                  Hire
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Headline & bio */}
      <div className="mt-5 max-w-xl">
        {profile?.headline ? (
          <p className="text-[15px] font-medium" style={{ color: "#0A1628" }}>
            {profile.headline}
          </p>
        ) : null}
        {profile?.bio ? (
          <p className="text-[14px] text-gray-500 leading-relaxed mt-1">
            {profile.bio}
          </p>
        ) : (
          <p className="text-[14px] text-gray-400 italic mt-1">
            Tell your story — edit your profile to add a bio
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {badgeConfig.map((b) =>
          showBadges[b.key] ? (
            <span
              key={b.key}
              className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-medium border ${b.bg} ${b.text} ${b.border}`}
            >
              {b.label}
            </span>
          ) : null,
        )}
      </div>
    </section>
  );
}
