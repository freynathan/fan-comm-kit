import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSites } from "@/hooks/useDashboardData";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4;
type Visibility = "public" | "unlisted" | "private";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

const StepDots = ({ step }: { step: Step }) => (
  <div className="flex items-center gap-2 mb-10">
    {[1, 2, 3, 4].map((n) => (
      <div
        key={n}
        className="h-1 flex-1 rounded-full transition-colors"
        style={{ backgroundColor: n <= step ? "#0C447C" : "#E5E7EB" }}
      />
    ))}
  </div>
);

const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div>
    <label className="block text-[13px] font-medium text-[#0A1628] mb-2">{label}</label>
    {children}
    {hint && <p className="text-[12px] text-ds-text-tertiary mt-1.5">{hint}</p>}
  </div>
);

const DashboardClubNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useSupabaseAuth();
  const { data: sites = [] } = useSites();

  useEffect(() => {
    if (!loading && !user) navigate("/?auth=signup", { replace: true });
  }, [user, loading, navigate]);

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [siteId, setSiteId] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [priceMonthly, setPriceMonthly] = useState("5");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const selectedSite = useMemo(() => sites.find((s) => s.id === siteId), [sites, siteId]);
  const accentColor = selectedSite?.accent_color ?? "#0C447C";

  // Auto-derive slug from name
  useEffect(() => {
    if (name && !slug) setSlug(slugify(name));
  }, [name, slug]);

  const canContinue = (): boolean => {
    if (step === 1) return !!siteId;
    if (step === 2) return name.trim().length >= 2 && slug.trim().length >= 2;
    if (step === 3) {
      if (isFree) return true;
      const p = parseFloat(priceMonthly);
      return !isNaN(p) && p > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!canContinue()) return;
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else navigate("/dashboard/clubs");
  };

  const handleSubmit = async () => {
    if (!user?.dbUserId) return;
    setSubmitting(true);
    try {
      const cleanBenefits = benefits.map((b) => b.trim()).filter(Boolean);
      const price = isFree ? 0 : parseFloat(priceMonthly) || 0;

      const { data, error } = await supabase
        .from("fan_clubs")
        .insert({
          owner_id: user.dbUserId,
          site_id: siteId,
          site_slug: selectedSite?.slug ?? null,
          name: name.trim(),
          slug: slug.trim(),
          tagline: tagline.trim() || null,
          is_free: isFree,
          price: price,
          price_monthly: price,
          visibility,
          benefits: cleanBenefits,
          welcome_message: welcomeMessage.trim() || null,
          accent_color: accentColor,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast({ title: "Club created", description: `${name} is live.` });
      navigate("/dashboard/clubs");
    } catch (err: any) {
      console.error("Create club failed", err);
      toast({
        title: "Could not create club",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>New club — Dashboard</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="max-w-[640px] mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[13px] text-ds-text-tertiary hover:text-[#0A1628] mb-6 transition-colors"
          >
            <ArrowLeft size={15} />
            {step === 1 ? "Back to clubs" : "Back"}
          </button>

          <p className="text-[12px] font-medium uppercase tracking-wider text-ds-text-tertiary mb-2">
            Step {step} of 4
          </p>
          <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.2] mb-2">
            {step === 1 && "Pick a community"}
            {step === 2 && "Name your club"}
            {step === 3 && "Set pricing & access"}
            {step === 4 && "Welcome your fans"}
          </h1>
          <p className="text-[14px] text-ds-text-secondary mb-8">
            {step === 1 && "Each club lives inside one of our 28 passion communities."}
            {step === 2 && "This is what fans see when they discover your club."}
            {step === 3 && "You can change pricing later. Free clubs grow faster."}
            {step === 4 && "Add the perks fans get and a welcome note."}
          </p>

          <StepDots step={step} />

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {sites.length === 0 ? (
                <p className="text-[14px] text-ds-text-tertiary">Loading communities…</p>
              ) : (
                sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSiteId(site.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      siteId === site.id ? "bg-[#F5F8FC]" : "bg-white hover:bg-[#FAFAFB]"
                    }`}
                    style={{
                      border:
                        siteId === site.id
                          ? "1px solid #0C447C"
                          : "0.5px solid hsl(var(--color-border))",
                    }}
                  >
                    <span className="text-[22px]">{site.emoji}</span>
                    <span className="flex-1 text-[14px] font-medium text-[#0A1628]">
                      {site.name}
                    </span>
                    {site.slug && (
                      <span className="text-[12px] text-ds-text-tertiary">{site.slug}.fan</span>
                    )}
                    {siteId === site.id && (
                      <Check size={16} strokeWidth={2.5} style={{ color: "#0C447C" }} />
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <Field label="Club name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inner Circle"
                  maxLength={60}
                  autoFocus
                />
              </Field>
              <Field label="URL slug" hint={`Your club: tobe.fan/c/${slug || "your-slug"}`}>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="inner-circle"
                  maxLength={40}
                />
              </Field>
              <Field
                label="Tagline (optional)"
                hint="One short line that explains what fans get."
              >
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="The closest place to me online"
                  maxLength={120}
                />
              </Field>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsFree(true)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isFree ? "bg-[#F5F8FC]" : "bg-white hover:bg-[#FAFAFB]"
                  }`}
                  style={{
                    border: isFree ? "1px solid #0C447C" : "0.5px solid hsl(var(--color-border))",
                  }}
                >
                  <p className="text-[14px] font-semibold text-[#0A1628]">Free</p>
                  <p className="text-[12px] text-ds-text-tertiary mt-1">
                    Open to anyone — grow fast.
                  </p>
                </button>
                <button
                  onClick={() => setIsFree(false)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    !isFree ? "bg-[#F5F8FC]" : "bg-white hover:bg-[#FAFAFB]"
                  }`}
                  style={{
                    border: !isFree ? "1px solid #0C447C" : "0.5px solid hsl(var(--color-border))",
                  }}
                >
                  <p className="text-[14px] font-semibold text-[#0A1628]">Paid</p>
                  <p className="text-[12px] text-ds-text-tertiary mt-1">
                    Recurring monthly subscription.
                  </p>
                </button>
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
                  />
                </Field>
              )}

              <Field label="Who can find this club?">
                <div className="space-y-2">
                  {(
                    [
                      { v: "public", t: "Public", d: "Listed in discovery and on your profile." },
                      { v: "unlisted", t: "Unlisted", d: "Only people with the link can find it." },
                      { v: "private", t: "Private", d: "Invite-only. You send invitations." },
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
                        className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center"
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
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <Field label="Member benefits" hint="What do fans get? Add up to 6.">
                <div className="space-y-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const next = [...benefits];
                          next[i] = e.target.value;
                          setBenefits(next);
                        }}
                        placeholder={i === 0 ? "Exclusive weekly posts" : "Another perk"}
                        maxLength={80}
                        className="flex-1"
                      />
                      {benefits.length > 1 && (
                        <button
                          onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-ds-text-tertiary hover:bg-[#F5F5F7]"
                          aria-label="Remove benefit"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                  {benefits.length < 6 && (
                    <button
                      onClick={() => setBenefits([...benefits, ""])}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-[#0C447C] hover:opacity-70 transition-opacity mt-1"
                    >
                      <Plus size={14} /> Add benefit
                    </button>
                  )}
                </div>
              </Field>

              <Field
                label="Welcome message (optional)"
                hint="Sent automatically when a fan joins."
              >
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Hey — so glad you're here. Here's what to expect…"
                  rows={4}
                  maxLength={500}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </Field>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              className="text-[14px] font-medium text-ds-text-secondary hover:text-[#0A1628] transition-colors"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canContinue()}
                className="flex items-center gap-2 h-11 px-6 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0C447C" }}
              >
                Continue
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 h-11 px-6 rounded-lg text-[14px] font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "#0C447C" }}
              >
                {submitting ? "Creating…" : "Create club"}
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardClubNew;
