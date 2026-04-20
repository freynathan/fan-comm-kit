import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { usePublicClub, useMembershipStatus } from "@/hooks/usePublicClub";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Lock, Sparkles, Users, ArrowLeft } from "lucide-react";

const PublicClub = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useSupabaseAuth();

  const { data: club, isLoading } = usePublicClub(slug);
  const { data: membership } = useMembershipStatus(club?.id, user?.dbUserId);

  const [joining, setJoining] = useState(false);

  const accent = club?.accent_color ?? "#0C447C";
  const isMember = membership?.status === "active";
  const price = Number(club?.price_monthly ?? club?.price ?? 0);

  const handleJoin = async () => {
    if (!club) return;
    if (!user) {
      navigate(`/?auth=signup&redirect=/c/${slug}`);
      return;
    }
    if (!user.dbUserId) {
      toast.error("Your account is still being set up. Please try again in a moment.");
      return;
    }
    if (isMember) return;

    setJoining(true);
    try {
      const { error: joinErr } = await supabase
        .from("fan_club_memberships")
        .insert({ club_id: club.id, user_id: user.dbUserId, status: "active" });
      if (joinErr) throw joinErr;

      const { error: eventErr } = await supabase.from("fan_trust_events").insert({
        club_id: club.id,
        user_id: user.dbUserId,
        event_type: club.is_free ? "joined" : "member_paid",
        points_awarded: club.is_free ? 2 : 10,
        description: club.is_free ? "Joined the club" : "Joined as paying member",
      });
      if (eventErr) console.error("Failed to record trust event:", eventErr);

      toast.success(`Welcome to ${club.name}!`);
      await queryClient.invalidateQueries({ queryKey: ["membership-status", club.id] });
      await queryClient.invalidateQueries({ queryKey: ["public-club", slug] });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "23505") {
        toast.success(`You're already a member of ${club.name}.`);
        await queryClient.invalidateQueries({ queryKey: ["membership-status", club.id] });
      } else {
        console.error(err);
        toast.error(e?.message || "Could not join club. Please try again.");
      }
    } finally {
      setJoining(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Helmet>
          <title>Club not found — tobe.fan</title>
        </Helmet>
        <h1 className="text-[28px] font-semibold text-[#0A1628] tracking-[-0.5px]">
          Club not found
        </h1>
        <p className="text-[15px] text-ds-text-secondary mt-2 text-center max-w-md">
          We couldn't find a club at <span className="font-mono">/c/{slug}</span>. It may have been
          removed or the link is wrong.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 h-10 px-5 rounded-lg text-[14px] font-medium text-white"
          style={{ backgroundColor: "#0C447C" }}
        >
          Back to home
        </button>
      </div>
    );
  }

  if (club.visibility === "private" && !isMember) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Helmet>
          <title>{club.name} — Private club</title>
        </Helmet>
        <Lock size={32} className="text-ds-text-tertiary mb-4" strokeWidth={1.5} />
        <h1 className="text-[28px] font-semibold text-[#0A1628] tracking-[-0.5px]">
          {club.name} is private
        </h1>
        <p className="text-[15px] text-ds-text-secondary mt-2 text-center max-w-md">
          This club is invite-only. Ask the owner for an invitation to join.
        </p>
      </div>
    );
  }

  const ownerInitials = club.ownerInitials || (club.ownerUsername ?? "?").slice(0, 2).toUpperCase();

  return (
    <>
      <Helmet>
        <title>{club.name} — Fan club on tobe.fan</title>
        <meta name="description" content={club.tagline || club.description || `Join ${club.name} on tobe.fan`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 md:px-10"
          style={{ borderBottom: "0.5px solid hsl(var(--color-border))" }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[13px] text-ds-text-secondary hover:text-[#0A1628] transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            tobe.fan
          </button>
          <span className="ml-auto text-[12px] text-ds-text-tertiary font-mono">
            tobe.fan/c/{club.slug}
          </span>
        </header>

        {/* Cover */}
        <div
          className="relative w-full h-[220px] md:h-[320px] flex items-end overflow-hidden"
          style={{
            backgroundColor: accent,
            backgroundImage: club.cover_image_url ? `url(${club.cover_image_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {club.cover_image_url && (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%)",
              }}
            />
          )}
        </div>

        {/* Content */}
        <main className="max-w-[860px] mx-auto px-5 md:px-10 -mt-12 md:-mt-16 pb-20">
          <div
            className="rounded-3xl bg-white p-6 md:p-10"
            style={{ border: "0.5px solid hsl(var(--color-border))" }}
          >
            <div className="flex items-start gap-4 md:gap-6 flex-wrap">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-[24px] md:text-[28px] font-semibold shrink-0"
                style={{ backgroundColor: accent }}
              >
                {club.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.7px] text-[#0A1628] leading-[1.15]">
                  {club.name}
                </h1>
                {club.tagline && (
                  <p className="text-[15px] md:text-[17px] text-ds-text-secondary mt-2 leading-[1.5]">
                    {club.tagline}
                  </p>
                )}

                {/* Owner + stats */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  {club.ownerUsername && (
                    <button
                      onClick={() => navigate(`/of/${club.ownerUsername}`)}
                      className="flex items-center gap-2 text-[13px] text-ds-text-secondary hover:text-[#0A1628] transition-colors"
                    >
                      {club.ownerAvatarUrl ? (
                        <img
                          src={club.ownerAvatarUrl}
                          alt={club.ownerUsername}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                          style={{ backgroundColor: "#0C447C" }}
                        >
                          {ownerInitials}
                        </div>
                      )}
                      <span>by @{club.ownerUsername}</span>
                    </button>
                  )}
                  <span className="text-ds-text-tertiary text-[12px]">·</span>
                  <span className="flex items-center gap-1.5 text-[13px] text-ds-text-secondary">
                    <Users size={13} strokeWidth={1.75} />
                    {club.member_count} {club.member_count === 1 ? "member" : "members"}
                  </span>
                  {club.fan_trust_score > 0 && (
                    <>
                      <span className="text-ds-text-tertiary text-[12px]">·</span>
                      <span className="flex items-center gap-1.5 text-[13px] text-ds-text-secondary">
                        <Sparkles size={13} strokeWidth={1.75} />
                        Trust {club.fan_trust_score}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {club.description && (
              <p className="text-[15px] text-ds-text-secondary leading-[1.6] mt-8 whitespace-pre-line">
                {club.description}
              </p>
            )}

            {/* Benefits */}
            {club.benefits && club.benefits.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-4">
                  What's included
                </h2>
                <ul className="space-y-3">
                  {club.benefits.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accent}1A` }}
                      >
                        <Check size={12} strokeWidth={2.5} style={{ color: accent }} />
                      </div>
                      <span className="text-[15px] text-[#0A1628] leading-[1.5]">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Welcome (members only) */}
            {isMember && club.welcome_message && (
              <div
                className="mt-8 p-5 rounded-2xl"
                style={{ backgroundColor: `${accent}0D`, border: `0.5px solid ${accent}33` }}
              >
                <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
                  A note from @{club.ownerUsername}
                </p>
                <p className="text-[15px] text-[#0A1628] leading-[1.5] whitespace-pre-line">
                  {club.welcome_message}
                </p>
              </div>
            )}

            {/* CTA */}
            <div
              className="mt-10 pt-8 flex items-center justify-between gap-4 flex-wrap"
              style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
            >
              <div>
                <div className="text-[28px] font-semibold text-[#0A1628] tracking-[-0.5px] leading-none">
                  {club.is_free ? "Free" : `€${price.toFixed(price % 1 === 0 ? 0 : 2)}`}
                  {!club.is_free && (
                    <span className="text-[15px] font-normal text-ds-text-tertiary ml-1">/month</span>
                  )}
                </div>
                <p className="text-[13px] text-ds-text-tertiary mt-1.5">
                  {club.is_free ? "Free to join, forever." : "Cancel anytime."}
                </p>
              </div>

              <button
                onClick={handleJoin}
                disabled={joining || isMember}
                className="h-12 px-7 rounded-full text-[15px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-default"
                style={{ backgroundColor: isMember ? "#22C55E" : accent }}
              >
                {isMember ? (
                  <span className="flex items-center gap-2">
                    <Check size={16} strokeWidth={2} />
                    You're a member
                  </span>
                ) : joining ? (
                  "Joining…"
                ) : !user ? (
                  club.is_free ? "Sign up to join free" : `Sign up to join · €${price.toFixed(0)}/mo`
                ) : club.is_free ? (
                  "Join free"
                ) : (
                  `Join · €${price.toFixed(0)}/mo`
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PublicClub;
