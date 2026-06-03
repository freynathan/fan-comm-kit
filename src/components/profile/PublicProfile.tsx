import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProfileData } from "@/hooks/useProfileData";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SharedHeader } from "@/components/shared/SharedHeader";
import { useActiveSiteHeader } from "@/hooks/useActiveSite";
import { SharedFooter } from "@/components/shared/SharedFooter";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { NotFoundProfile } from "./NotFoundProfile";
import { ProfileHeader } from "./ProfileHeader";
import { SocialStrip } from "./SocialStrip";
import { StatsBar } from "./StatsBar";
import { PassionTags } from "./PassionTags";
import { BrandCollabsSection } from "./BrandCollabsSection";
import { FanClubsSection } from "./FanClubsSection";
import { ExpertiseSection } from "./ExpertiseSection";
import { ProfileFooter } from "./ProfileFooter";

export function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { data, loading, notFound } = useProfileData(username);
  const { user: authUser } = useSupabaseAuth();
  const activeSiteHeader = useActiveSiteHeader();

  if (loading) return <ProfileSkeleton />;
  if (notFound || !data) return <NotFoundProfile username={username ?? ""} />;

  const { user, profile, socialLinks, fanClubs, brandCollabs, passionPoints, fanCount } = data;
  const isOwner = authUser && data.user.auth_id === authUser.id;
  const totalReach = socialLinks.reduce((sum, s) => sum + s.follower_count, 0);
  const totalPassionPoints = passionPoints.reduce((sum, p) => sum + p.points, 0);

  const sameAsUrls = socialLinks.filter((s) => s.url).map((s) => s.url!);

  return (
    <>
      <Helmet>
        <title>{user.display_name ?? user.username} — tobe.fan/of/{user.username}</title>
        <meta
          name="description"
          content={`${profile?.headline ?? "Creator"} on tobe.fan with ${fanCount} fans across ${passionPoints.length} communities.`}
        />
        <meta property="og:title" content={`${user.display_name ?? user.username} on tobe.fan`} />
        <meta property="og:description" content={profile?.headline ?? ""} />
        {user.avatar_url && <meta property="og:image" content={user.avatar_url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: user.display_name ?? user.username,
            url: `https://tobe.fan/of/${user.username}`,
            description: profile?.bio ?? "",
            image: user.avatar_url ?? "",
            sameAs: sameAsUrls,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white flex flex-col">
        <SharedHeader {...activeSiteHeader} />
        <div className="max-w-3xl mx-auto px-6 w-full flex-1">
          <ProfileHeader
            user={user}
            profile={profile}
            isOwner={!!isOwner}
            badges={{
              verified: profile?.verified ?? false,
              fanClubOwner: fanClubs.length > 0,
              brandCollaborator: brandCollabs.length > 0,
              topContributor: totalPassionPoints > 500,
            }}
          />

          <SocialStrip socialLinks={socialLinks} fanCount={fanCount} />

          <StatsBar
            totalReach={totalReach + fanCount}
            fanClubCount={fanClubs.length}
            communityCount={passionPoints.length}
            brandCollabCount={brandCollabs.length}
          />

          <PassionTags passionPoints={passionPoints} />

          <BrandCollabsSection brandCollabs={brandCollabs} />

          <FanClubsSection fanClubs={fanClubs} />

          <ExpertiseSection passionPoints={passionPoints} />
        </div>

        <ProfileFooter />
        <SharedFooter />
      </div>
    </>
  );
}
