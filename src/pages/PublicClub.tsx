import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { usePublicClub, useMembershipStatus } from "@/hooks/usePublicClub";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Lock, Users, Star, ArrowLeft, MessageSquare } from "lucide-react";

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

  const isPrivate = club.visibility === "private" && !isMember;
  const ownerInitials = club.ownerInitials || (club.ownerUsername ?? "?").slice(0, 2).toUpperCase();
  const priceLabel = club.is_free ? "Free" : `€${price.toFixed(price % 1 === 0 ? 0 : 2)}/mo`;

  return (
    <>
      <Helmet>
        <title>{club.name} — Fan club on tobe.fan</title>
        <meta name="description" content={club.tagline || club.description || `Join ${club.name} on tobe.fan`} />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 md:px-10 bg-white"
          style={{ borderBottom: "0.5px solid #E5E5E5" }}
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

        {/* HEADER SECTION — clean white */}
        <section
          className="bg-white pt-12 pb-10 px-5 md:px-10"
          style={{ borderBottom: "0.5px solid #E5E5E5" }}
        >
          <div className="max-w-[860px] mx-auto flex items-start gap-6 md:gap-8 flex-wrap md:flex-nowrap">
            {/* Cover / avatar */}
            {club.cover_image_url ? (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-[32px] font-semibold shrink-0"
                style={{ backgroundColor: accent }}
              >
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-semibold tracking-[-0.5px] text-[#0A1628] leading-[1.2]">
                {club.name}
              </h1>
              {club.tagline && (
                <p className="text-[15px] text-ds-text-secondary mt-1.5 leading-[1.5]">
                  {club.tagline}
                </p>
              )}

              {/* Owner row */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
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
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto">
              <span
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 h-7 rounded-full"
                style={{ backgroundColor: "#F5F5F7", color: "#0A1628" }}
              >
                <Users size={12} strokeWidth={2} />
                {club.member_count} {club.member_count === 1 ? "member" : "members"}
              </span>
              <span
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 h-7 rounded-full"
                style={{ backgroundColor: "#F5F5F7", color: "#0A1628" }}
              >
                <Star size={12} strokeWidth={2} />
                Fan Trust Score {club.fan_trust_score}
              </span>
              <span
                className="text-[12px] font-medium px-3 h-7 rounded-full inline-flex items-center"
                style={{
                  backgroundColor: club.is_free ? "rgba(16,185,129,0.12)" : `${accent}1A`,
                  color: club.is_free ? "#10B981" : accent,
                }}
              >
                {priceLabel}
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <main className="max-w-[860px] mx-auto px-5 md:px-10 py-10 space-y-6">
          {/* PRIVATE STATE */}
          {isPrivate ? (
            <div
              className="rounded-2xl bg-white p-6 md:p-8 flex flex-col items-center text-center"
              style={{ border: "0.5px solid #E5E5E5" }}
            >
              <Lock size={28} className="text-ds-text-tertiary mb-3" strokeWidth={1.5} />
              <p className="text-[16px] font-semibold text-[#0A1628]">
                This is a private club.
              </p>
              <p className="text-[14px] text-ds-text-secondary mt-1.5 max-w-md">
                Request an invitation from the owner.
              </p>
              <button
                className="mt-5 h-10 px-5 rounded-lg text-[14px] font-medium bg-transparent transition-colors"
                style={{ border: `1px solid ${accent}`, color: accent }}
              >
                Request invitation
              </button>
            </div>
          ) : (
            /* MEMBERSHIP CARD */
            <div
              className="rounded-2xl bg-white p-6 md:p-8"
              style={{ border: "0.5px solid #E5E5E5" }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  {club.is_free ? (
                    <>
                      <p className="text-[20px] font-semibold text-[#0A1628] tracking-[-0.3px]">
                        Free to join, forever.
                      </p>
                      <p className="text-[13px] text-ds-text-tertiary mt-1">
                        Become a member and unlock the community.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-[28px] font-semibold text-[#0A1628] tracking-[-0.5px] leading-none">
                        €{price.toFixed(price % 1 === 0 ? 0 : 2)}
                        <span className="text-[15px] font-normal text-ds-text-tertiary ml-1">
                          /month
                        </span>
                      </div>
                      <p className="text-[13px] text-ds-text-tertiary mt-1.5">
                        Cancel anytime.
                      </p>
                    </>
                  )}
                </div>

                <button
                  onClick={handleJoin}
                  disabled={joining || isMember}
                  className="h-12 px-7 rounded-full text-[15px] font-medium text-white transition-all active:scale-[0.98] disabled:cursor-default"
                  style={{
                    backgroundColor: accent,
                    opacity: joining ? 0.6 : 1,
                  }}
                >
                  {isMember ? (
                    <span className="flex items-center gap-2" style={{ color: "#fff" }}>
                      <Check size={16} strokeWidth={2.5} />
                      You're a member
                    </span>
                  ) : joining ? (
                    "Joining…"
                  ) : !user ? (
                    club.is_free ? "Sign up to join free" : `Sign up to subscribe`
                  ) : club.is_free ? (
                    "Join this club"
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              {/* Benefits list (paid clubs) */}
              {!club.is_free && club.benefits && club.benefits.filter(Boolean).length > 0 && (
                <ul className="space-y-3 mt-6 pt-6" style={{ borderTop: "0.5px solid #E5E5E5" }}>
                  {club.benefits.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accent}1A` }}
                      >
                        <Check size={12} strokeWidth={2.5} style={{ color: accent }} />
                      </div>
                      <span className="text-[14px] text-[#0A1628] leading-[1.5]">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ABOUT SECTION */}
          {(club.welcome_message || club.description ||
            (club.is_free && club.benefits && club.benefits.filter(Boolean).length > 0)) && (
            <div
              className="rounded-2xl bg-white p-6 md:p-8"
              style={{ border: "0.5px solid #E5E5E5" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-4">
                About this club
              </p>

              {club.welcome_message && (
                <div className="mb-6">
                  <p className="text-[12px] font-medium uppercase tracking-wider mb-2" style={{ color: accent }}>
                    A note from @{club.ownerUsername}
                  </p>
                  <p className="text-[15px] text-[#0A1628] leading-[1.6] whitespace-pre-line">
                    {club.welcome_message}
                  </p>
                </div>
              )}

              {club.description && (
                <p className="text-[15px] text-ds-text-secondary leading-[1.6] whitespace-pre-line">
                  {club.description}
                </p>
              )}

              {/* Benefits for free clubs */}
              {club.is_free && club.benefits && club.benefits.filter(Boolean).length > 0 && (
                <ul className="space-y-3 mt-6">
                  {club.benefits.filter(Boolean).map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${accent}1A` }}
                      >
                        <Check size={12} strokeWidth={2.5} style={{ color: accent }} />
                      </div>
                      <span className="text-[14px] text-[#0A1628] leading-[1.5]">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* POSTS FEED */}
          <div
            className="rounded-2xl bg-white p-6 md:p-8"
            style={{ border: "0.5px solid #E5E5E5" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ds-text-tertiary mb-5">
              Club posts
            </p>
            <div className="flex flex-col items-center text-center py-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "#F5F5F7" }}
              >
                <MessageSquare size={20} strokeWidth={1.5} className="text-ds-text-tertiary" />
              </div>
              <p className="text-[14px] text-ds-text-secondary">
                No posts yet. The owner hasn't posted anything yet.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PublicClub;
