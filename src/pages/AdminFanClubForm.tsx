import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSites } from "@/hooks/useDashboardData";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClubType = "passion" | "brand";
type Visibility = "public" | "unlisted" | "private";

interface FeaturesMap {
  community_feed: boolean;
  fan_tiers: boolean;
  exclusive_content: boolean;
  events: boolean;
  challenges: boolean;
  shop_the_look: boolean;
  ai_advisor: boolean;
  brand_dashboard: boolean;
  fan_trust_score: boolean;
  newsletter: boolean;
  [key: string]: boolean;
}

const DEFAULT_FEATURES: FeaturesMap = {
  community_feed: true,
  fan_tiers: false,
  exclusive_content: false,
  events: false,
  challenges: false,
  shop_the_look: false,
  ai_advisor: false,
  brand_dashboard: false,
  fan_trust_score: true,
  newsletter: false,
};

const FEATURE_DEFS = [
  { key: "community_feed", label: "Community Feed", description: "Members can post, share and discuss" },
  { key: "fan_tiers", label: "Fan Tiers", description: "Free, Verified and Ambassador membership levels" },
  { key: "exclusive_content", label: "Exclusive Content", description: "Locked posts for paying members" },
  { key: "events", label: "Events", description: "IRL and virtual fan meetups" },
  { key: "challenges", label: "Challenges", description: "Fan contests and missions" },
  { key: "shop_the_look", label: "Shop the Look", description: "Shoppable content and outfit links" },
  { key: "ai_advisor", label: "AI Advisor", description: "AI-powered style or topic assistant" },
  { key: "brand_dashboard", label: "Brand Dashboard", description: "Analytics for brand fan clubs", brandOnly: true },
  { key: "fan_trust_score", label: "Fan Trust Score", description: "Visible reputation system for members" },
  { key: "newsletter", label: "Newsletter", description: "Email broadcasts to club members" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
  <div className="mb-5" style={{ borderBottom: "0.5px solid hsl(var(--color-border))", paddingBottom: "12px" }}>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-ds-text-tertiary">{title}</p>
  </div>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-[13px] font-medium text-[#0A1628] mb-2">{label}</label>
    {children}
    {hint && <p className="text-[12px] text-ds-text-tertiary mt-1.5">{hint}</p>}
  </div>
);

const inputCls =
  "w-full h-10 px-3 rounded-lg text-[13px] text-[#0A1628] bg-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#0C447C]";
const inputStyle = { border: "0.5px solid hsl(var(--color-border-strong))" };

// ─── Main component ───────────────────────────────────────────────────────────

const AdminFanClubForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading } = useSupabaseAuth();
  const { data: sites = [] } = useSites();

  // ── Admin guard ──────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) navigate("/", { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  // ── Form state ───────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ClubType>("passion");
  const [siteId, setSiteId] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#0C447C");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [features, setFeatures] = useState<FeaturesMap>({ ...DEFAULT_FEATURES });
  const [brandUrl, setBrandUrl] = useState("");
  const [brandAiSummary, setBrandAiSummary] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [priceMonthly, setPriceMonthly] = useState("5");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // ── Load existing club for edit ──────────────────────────────────────────
  const { isLoading: clubLoading } = useQuery({
    queryKey: ["admin-fan-club", id],
    enabled: isEdit && !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_clubs")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    // Populate form on load
    select: (data) => {
      setName(data.name ?? "");
      setSlug(data.slug ?? "");
      setSlugEdited(true);
      setTagline(data.tagline ?? "");
      setDescription(data.description ?? "");
      setType((data.type as ClubType) ?? "passion");
      setSiteId(data.site_id ?? "");
      setCoverImageUrl(data.cover_image_url ?? "");
      setAccentColor(data.accent_color ?? "#0C447C");
      setWelcomeMessage(data.welcome_message ?? "");
      const merged = { ...DEFAULT_FEATURES, ...(data.features as FeaturesMap ?? {}) };
      setFeatures(merged);
      setBrandUrl(data.brand_url ?? "");
      setBrandAiSummary(data.brand_ai_summary ?? "");
      setIsFree(data.is_free ?? true);
      setPriceMonthly(String(data.price_monthly ?? "5"));
      setVisibility((data.visibility as Visibility) ?? "public");
      return data;
    },
  });

  // Auto-slug from name (only if not manually edited)
  useEffect(() => {
    if (!slugEdited && name) setSlug(slugify(name));
  }, [name, slugEdited]);

  const selectedSite = useMemo(() => sites.find((s) => s.id === siteId), [sites, siteId]);

  // ── Brand AI summary ─────────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    if (!brandUrl.trim()) return;
    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-brand", {
        body: { url: brandUrl.trim() },
      });
      if (error) throw error;
      setBrandAiSummary(data?.summary ?? "");
    } catch (err: any) {
      toast({
        title: "Could not generate summary",
        description: err.message || "Check the brand URL and try again.",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) return;
    if (!user?.dbUserId) return;
    setSubmitting(true);

    const payload = {
      owner_id: user.dbUserId,
      name: name.trim(),
      slug: slug.trim(),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      type,
      site_id: siteId || null,
      site_slug: selectedSite?.slug ?? null,
      cover_image_url: coverImageUrl.trim() || null,
      accent_color: accentColor,
      welcome_message: welcomeMessage.trim() || null,
      features,
      brand_url: type === "brand" ? brandUrl.trim() || null : null,
      brand_ai_summary: type === "brand" ? brandAiSummary.trim() || null : null,
      is_free: isFree,
      price_monthly: isFree ? 0 : parseFloat(priceMonthly) || 0,
      visibility,
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from("fan_clubs").update(payload).eq("id", id!);
        if (error) throw error;
        toast({ title: "Club updated", description: `${name} saved.` });
      } else {
        const { error } = await supabase.from("fan_clubs").insert(payload);
        if (error) throw error;
        toast({ title: "Club created", description: `${name} is live.` });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-fan-clubs"] });
      navigate("/admin/fan-clubs");
    } catch (err: any) {
      toast({
        title: isEdit ? "Could not update club" : "Could not create club",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const canSave = name.trim().length >= 2 && slug.trim().length >= 2;

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading || adminLoading || !user || (isEdit && clubLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? "Edit Fan Club" : "New Fan Club"} — Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        <div className="max-w-[720px]">
          {/* Back */}
          <button
            onClick={() => navigate("/admin/fan-clubs")}
            className="flex items-center gap-1.5 text-[13px] text-ds-text-tertiary hover:text-[#0A1628] mb-6 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Fan Clubs
          </button>

          {/* Header */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
              Admin
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15]">
              {isEdit ? "Edit Fan Club" : "New Fan Club"}
            </h1>
          </div>

          <div className="space-y-12">
            {/* ── IDENTITY ──────────────────────────────────────────────── */}
            <section>
              <SectionHeader title="Identity" />
              <div className="space-y-5">
                {/* Type toggle */}
                <Field label="Club type">
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { v: "passion", t: "Passion Community", d: "Fan-created, topic-based club" },
                        { v: "brand", t: "Brand Fan Club", d: "Brand-owned, has brand dashboard" },
                      ] as { v: ClubType; t: string; d: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setType(opt.v)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          type === opt.v ? "bg-[#F5F8FC]" : "bg-white hover:bg-[#FAFAFB]"
                        }`}
                        style={{
                          border:
                            type === opt.v
                              ? "1px solid #0C447C"
                              : "0.5px solid hsl(var(--color-border))",
                        }}
                      >
                        <p className="text-[13px] font-semibold text-[#0A1628]">{opt.t}</p>
                        <p className="text-[12px] text-ds-text-tertiary mt-0.5">{opt.d}</p>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Name */}
                <Field label="Club name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. LVMH Fan Club"
                    maxLength={60}
                    autoFocus
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Slug */}
                <Field label="URL slug" hint={selectedSite ? `tobe.fan/of/${slug || "your-slug"}?site=${selectedSite.slug}` : `tobe.fan/of/${slug || "your-slug"}`}>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="lvmh-fan-club"
                    maxLength={50}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Tagline */}
                <Field label="Tagline" hint="One line that captures what this club is about.">
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="The home of LVMH fans worldwide"
                    maxLength={120}
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Site */}
                <Field label="Site" hint="Which passion community does this club live in?">
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">— Select a site —</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name} ({s.slug}.fan)
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Cover image */}
                <Field label="Cover image URL" hint="Recommended: 1200×400px">
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>

                {/* Accent color */}
                <Field label="Accent color">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5 bg-white"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#0C447C"
                      maxLength={7}
                      className={inputCls + " flex-1"}
                      style={inputStyle}
                    />
                  </div>
                </Field>

                {/* Welcome message */}
                <Field
                  label="Welcome message"
                  hint="Sent automatically when a fan joins."
                >
                  <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hey — so glad you're here. Here's what to expect…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg text-[13px] text-[#0A1628] bg-white resize-vertical focus:outline-none focus:ring-1 focus:ring-[#0C447C]"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            {/* ── FEATURES ──────────────────────────────────────────────── */}
            <section>
              <SectionHeader title="Features" />
              <div className="space-y-1">
                {FEATURE_DEFS.filter((f) => !("brandOnly" in f) || type === "brand").map((feat) => (
                  <div
                    key={feat.key}
                    className="flex items-center justify-between gap-4 py-3.5 px-4 rounded-xl hover:bg-[#FAFAFB] transition-colors"
                    style={{ border: "0.5px solid transparent" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#0A1628]">{feat.label}</p>
                      <p className="text-[12px] text-ds-text-tertiary mt-0.5">{feat.description}</p>
                    </div>
                    <Switch
                      checked={features[feat.key] ?? false}
                      onCheckedChange={(checked) =>
                        setFeatures((prev) => ({ ...prev, [feat.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── BRAND ─────────────────────────────────────────────────── */}
            {type === "brand" && (
              <section>
                <SectionHeader title="Brand" />
                <div className="space-y-5">
                  <Field
                    label="Brand URL"
                    hint="Paste the brand website — AI will generate a summary for the fan club page."
                  >
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={brandUrl}
                        onChange={(e) => setBrandUrl(e.target.value)}
                        placeholder="https://lvmh.com"
                        className={inputCls + " flex-1"}
                        style={inputStyle}
                      />
                      <button
                        onClick={handleGenerateSummary}
                        disabled={!brandUrl.trim() || summarizing}
                        className="flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-medium text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        style={{ backgroundColor: "#0C447C" }}
                      >
                        {summarizing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} strokeWidth={2} />
                        )}
                        {summarizing ? "Generating…" : "Generate with AI"}
                      </button>
                    </div>
                  </Field>

                  <Field
                    label="Brand AI summary"
                    hint="Auto-filled from the brand URL. Edit as needed."
                  >
                    <textarea
                      value={brandAiSummary}
                      onChange={(e) => setBrandAiSummary(e.target.value)}
                      placeholder="AI-generated brand summary will appear here…"
                      rows={5}
                      className="w-full px-3 py-2.5 rounded-lg text-[13px] text-[#0A1628] bg-white resize-vertical focus:outline-none focus:ring-1 focus:ring-[#0C447C]"
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </section>
            )}

            {/* ── MONETISATION ──────────────────────────────────────────── */}
            <section>
              <SectionHeader title="Monetisation" />
              <div className="space-y-5">
                <div
                  className="flex items-center justify-between gap-4 py-4 px-4 rounded-xl"
                  style={{ border: "0.5px solid hsl(var(--color-border))" }}
                >
                  <div>
                    <p className="text-[13px] font-medium text-[#0A1628]">Free club</p>
                    <p className="text-[12px] text-ds-text-tertiary mt-0.5">
                      Open to anyone — grows faster.
                    </p>
                  </div>
                  <Switch
                    checked={isFree}
                    onCheckedChange={setIsFree}
                  />
                </div>

                {!isFree && (
                  <Field label="Monthly price (EUR)">
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(e.target.value)}
                      placeholder="5"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </Field>
                )}

                <Field label="Visibility">
                  <div className="space-y-2">
                    {(
                      [
                        { v: "public", t: "Public", d: "Listed in discovery and on profiles." },
                        { v: "unlisted", t: "Unlisted", d: "Only people with the link can find it." },
                        { v: "private", t: "Private", d: "Invite-only." },
                      ] as { v: Visibility; t: string; d: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setVisibility(opt.v)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                          visibility === opt.v ? "bg-[#F5F8FC]" : "bg-white hover:bg-[#FAFAFB]"
                        }`}
                        style={{
                          border:
                            visibility === opt.v
                              ? "1px solid #0C447C"
                              : "0.5px solid hsl(var(--color-border))",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full mt-0.5 shrink-0"
                          style={{
                            border:
                              visibility === opt.v
                                ? "5px solid #0C447C"
                                : "1.5px solid hsl(var(--color-border-strong))",
                          }}
                        />
                        <div>
                          <p className="text-[13px] font-medium text-[#0A1628]">{opt.t}</p>
                          <p className="text-[12px] text-ds-text-tertiary">{opt.d}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </section>
          </div>

          {/* ── Save bar ─────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between mt-12 pt-6"
            style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
          >
            <button
              onClick={() => navigate("/admin/fan-clubs")}
              className="text-[14px] font-medium text-ds-text-secondary hover:text-[#0A1628] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || submitting}
              className="flex items-center gap-2 h-11 px-7 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#0C447C" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create Fan Club"
              )}
            </button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminFanClubForm;
