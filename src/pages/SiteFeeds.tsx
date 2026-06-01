import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, Rss } from "lucide-react";

const SiteFeeds = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useSupabaseAuth();

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-check", user?.dbUserId],
    enabled: !!user?.dbUserId,
    queryFn: async () => {
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user!.dbUserId!)
        .maybeSingle();
      return !!data;
    },
  });

  const { data: site } = useQuery({
    queryKey: ["site-by-slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await supabase
        .from("sites")
        .select("id, name, slug, emoji")
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) navigate("/", { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  if (loading || adminLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{site ? `${site.name} Feeds` : "Feeds"} — Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        <div className="max-w-[720px]">
          <button
            onClick={() => navigate("/admin/network")}
            className="flex items-center gap-1.5 text-[13px] text-ds-text-tertiary hover:text-[#0A1628] mb-6 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Network
          </button>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
            Admin / Network / {site?.name ?? slug}
          </p>
          <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15] mb-8">
            {site?.emoji && <span className="mr-2">{site.emoji}</span>}
            Feeds
          </h1>

          <div
            className="rounded-2xl px-8 py-12 flex flex-col items-center text-center"
            style={{ border: "0.5px dashed hsl(var(--color-border))" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#F0F4FF" }}
            >
              <Rss size={22} strokeWidth={1.5} style={{ color: "#0C447C" }} />
            </div>
            <p className="text-[16px] font-semibold text-[#0A1628] mb-2">
              Feed management for {site?.name ?? slug}.fan
            </p>
            <p className="text-[13px] text-ds-text-tertiary max-w-sm leading-[1.6]">
              RSS feed configuration, news source management, and content ingestion
              settings for this site will appear here.
            </p>
            <p className="mt-4 text-[12px] text-ds-text-tertiary">Coming soon</p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default SiteFeeds;
