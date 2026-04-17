import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { sendWelcomeEmail } from "@/lib/emailjs";
import { Step1ClaimUrl } from "./Step1ClaimUrl";
import { Step2Passions } from "./Step2Passions";
import { Step3Profile } from "./Step3Profile";
import { Step4Welcome } from "./Step4Welcome";

const STEP_LABELS = ["Your identity", "Your passions", "Your profile", "You're in"];
const STORAGE_KEY = "tobe_onboarding_progress";

export interface OnboardingData {
  username: string;
  accountType: "personal" | "business";
  selectedSites: { id: string; name: string; emoji: string; accent_color: string }[];
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
}

const defaultData: OnboardingData = {
  username: "",
  accountType: "personal",
  selectedSites: [],
  displayName: "",
  headline: "",
  bio: "",
  avatarUrl: "",
};

interface OnboardingFlowProps {
  /** After onboarding, redirect here instead of /dashboard */
  returnTo?: string;
}

export function OnboardingFlow({ returnTo }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useSupabaseAuth();

  const sourceIsGoogle = searchParams.get("source") === "google";
  const requestedStep = parseInt(searchParams.get("step") ?? "", 10);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed.data };
      }
    } catch {}
    return defaultData;
  });

  // Restore step from localStorage — but ?step= URL param wins for Google flow
  useEffect(() => {
    if (sourceIsGoogle && requestedStep >= 1 && requestedStep <= 4) {
      setStep(requestedStep);
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
      }
    } catch {}
  }, [sourceIsGoogle, requestedStep]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  // Redirect if already onboarded
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
  }, [user, loading, navigate, returnTo]);

  // Pre-fill from auth — for Google sign-in, pull display_name + avatar from session metadata
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const meta = session?.user?.user_metadata ?? {};
      const googleName: string | undefined = meta.full_name || meta.name;
      const googleAvatar: string | undefined = meta.avatar_url || meta.picture;

      setData((d) => ({
        ...d,
        username: d.username || user.username || "",
        displayName: d.displayName || googleName || user.username || "",
        avatarUrl: d.avatarUrl || googleAvatar || "",
      }));
    })();
  }, [user]);

  const update = (partial: Partial<OnboardingData>) =>
    setData((d) => ({ ...d, ...partial }));

  const handleComplete = async () => {
    if (!user) return;

    // Save to users table (only columns that exist in schema)
    await supabase
      .from("users")
      .upsert({
        id: user.id,
        username: data.username,
        display_name: data.displayName,
        avatar_url: data.avatarUrl || null,
        email: user.email || "",
      });

    // Save to profiles table
    await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        headline: data.headline,
        bio: data.bio,
      });

    // Save passion_points
    if (data.selectedSites.length > 0) {
      const points = data.selectedSites.map((s) => ({
        user_id: user.id,
        site_id: s.id,
        points: 0,
        level: "enthusiast",
      }));
      await supabase.from("passion_points").upsert(points, {
        onConflict: "user_id,site_id",
      });
    }

    localStorage.removeItem(STORAGE_KEY);
    navigate(returnTo || "/dashboard");
  };

  const progress = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-[#0C447C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: "#0C447C" }}
        />
      </div>

      {/* Step labels */}
      <div className="flex items-center justify-center gap-4 py-4 px-4 text-[11px] font-medium tracking-wide">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          let color = "#d1d5db"; // upcoming
          if (stepNum < step) color = "#9ca3af"; // completed
          if (stepNum === step) color = "#0A1628"; // current
          return (
            <span key={label} style={{ color }} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: "#d1d5db" }}>·</span>}
              {label}
            </span>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {step === 1 && (
            <Step1ClaimUrl
              data={data}
              update={update}
              onContinue={() => {
                // Fire welcome email (non-blocking)
                if (user?.email && data.username) {
                  sendWelcomeEmail({
                    toEmail: user.email,
                    username: data.username,
                    profileUrl: `https://tobe.fan/of/${data.username}`,
                  }).catch(console.error);
                }
                setStep(2);
              }}
              userId={user?.id}
            />
          )}
          {step === 2 && (
            <Step2Passions
              data={data}
              update={update}
              onContinue={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Profile
              data={data}
              update={update}
              onContinue={() => setStep(4)}
              onBack={() => setStep(2)}
              userId={user?.id}
            />
          )}
          {step === 4 && (
            <Step4Welcome
              data={data}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
