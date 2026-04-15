import { useState, useEffect, useCallback } from "react";
import { Check, X, User, Building2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OnboardingData } from "./OnboardingFlow";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onContinue: () => void;
  userId?: string;
}

export function Step1ClaimUrl({ data, update, onContinue, userId }: Props) {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

  const checkAvailability = useCallback(
    async (username: string) => {
      if (!username || username.length < 2) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .neq("id", userId || "")
        .maybeSingle();
      setAvailable(!existing);
      setChecking(false);
    },
    [userId]
  );

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => checkAvailability(data.username), 500);
    return () => clearTimeout(timer);
  }, [data.username, checkAvailability, touched]);

  const canContinue = data.username.length >= 2 && available === true;

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0A1628" }}>
        Claim your tobe.fan/of/you
      </h1>
      <p className="mt-2 text-[15px]" style={{ color: "#6b7280" }}>
        This is your permanent passion identity — free forever.
      </p>

      {/* URL display */}
      <div className="mt-10 flex items-center justify-center gap-0">
        <span className="text-lg font-medium" style={{ color: "#9ca3af" }}>
          tobe.fan/of/
        </span>
        <input
          type="text"
          value={data.username}
          onChange={(e) => {
            const v = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
            update({ username: v });
            setTouched(true);
          }}
          placeholder="yourname"
          className="text-lg font-bold border-b-2 border-gray-200 focus:border-[#0C447C] outline-none bg-transparent px-1 py-1 w-44 transition-colors"
          style={{ color: "#0A1628" }}
          autoFocus
        />
        {checking && (
          <div className="ml-2 w-4 h-4 border-2 border-[#0C447C] border-t-transparent rounded-full animate-spin" />
        )}
        {!checking && available === true && touched && (
          <span className="ml-2 flex items-center gap-1 text-sm font-medium text-green-600">
            <Check size={14} /> Available
          </span>
        )}
        {!checking && available === false && touched && (
          <span className="ml-2 flex items-center gap-1 text-sm font-medium text-red-500">
            <X size={14} /> Taken — try another
          </span>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 space-y-1.5 text-[13px]" style={{ color: "#9ca3af" }}>
        <p>· tobe.fan/of/marco looks great on a business card</p>
        <p>· Share it as your bio link on Instagram, TikTok, YouTube</p>
        <p>· Brands search for creators by their tobe.fan identity</p>
      </div>

      {/* Account type selector */}
      <div className="mt-10 flex gap-4 justify-center">
        {[
          { type: "personal" as const, icon: User, label: "Personal", desc: "I'm a fan or creator" },
          { type: "business" as const, icon: Building2, label: "Business / Brand", desc: "I represent a brand or company" },
        ].map((opt) => {
          const selected = data.accountType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => update({ accountType: opt.type })}
              className="flex-1 max-w-[220px] rounded-xl border-2 p-5 text-left transition-all"
              style={{
                borderColor: selected ? "#0C447C" : "#e5e7eb",
                backgroundColor: selected ? "#E6F1FB" : "white",
              }}
            >
              <opt.icon size={20} style={{ color: selected ? "#0C447C" : "#9ca3af" }} />
              <div className="mt-2 text-sm font-semibold" style={{ color: "#0A1628" }}>
                {opt.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="mt-10 h-12 px-8 rounded-xl text-[15px] font-semibold text-white flex items-center gap-2 mx-auto transition-opacity disabled:opacity-40"
        style={{ backgroundColor: "#0C447C" }}
      >
        Claim tobe.fan/of/{data.username || "..."} <ArrowRight size={16} />
      </button>
    </div>
  );
}
