import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { OnboardingData } from "./OnboardingFlow";

interface Props {
  data: OnboardingData;
  update: (d: Partial<OnboardingData>) => void;
  onContinue: () => void;
  onBack: () => void;
  userId?: string;
}

export function Step3Profile({ data, update, onContinue, onBack, userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    update({ avatarUrl: urlData.publicUrl });
    setUploading(false);
  };

  return (
    <div className="text-center">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm mb-6 mx-auto"
        style={{ color: "#6b7280" }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0A1628" }}>
        Tell your story
      </h1>
      <p className="mt-2 text-[15px]" style={{ color: "#6b7280" }}>
        This is what fans, brands, and AI agents see when they find you.
      </p>

      {/* Avatar */}
      <div className="mt-10 flex flex-col items-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-colors hover:border-[#0C447C]"
          style={{
            backgroundImage: data.avatarUrl ? `url(${data.avatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!data.avatarUrl && (
            <Camera size={24} style={{ color: "#9ca3af" }} />
          )}
          {uploading && (
            <div className="w-6 h-6 border-2 border-[#0C447C] border-t-transparent rounded-full animate-spin" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <span className="mt-2 text-[12px]" style={{ color: "#9ca3af" }}>
          Add your photo
        </span>
      </div>

      {/* Name & headline */}
      <div className="mt-8 space-y-4 text-left max-w-md mx-auto">
        <div>
          <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6b7280" }}>
            Your name
          </label>
          <input
            type="text"
            value={data.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[15px] outline-none focus:border-[#0C447C] transition-colors"
            style={{ color: "#0A1628" }}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6b7280" }}>
            Your headline in one line
          </label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => {
              if (e.target.value.length <= 120) update({ headline: e.target.value });
            }}
            placeholder="Porsche enthusiast · Marathon runner · Cocktail creator"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[15px] outline-none focus:border-[#0C447C] transition-colors"
            style={{ color: "#0A1628" }}
          />
          <div className="text-right text-[11px] mt-1" style={{ color: "#9ca3af" }}>
            {data.headline.length}/120
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6b7280" }}>
            Tell your story (optional)
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => {
              if (e.target.value.length <= 300) update({ bio: e.target.value });
            }}
            placeholder="What are you passionate about? What brings you here? What would you love to connect with others about?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] outline-none focus:border-[#0C447C] transition-colors resize-none"
            style={{ color: "#0A1628" }}
          />
          <div className="text-right text-[11px] mt-1" style={{ color: "#9ca3af" }}>
            {data.bio.length}/300
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="mt-8 mx-auto max-w-sm rounded-2xl border border-gray-100 p-6 bg-gray-50/50">
        <div className="text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: "#9ca3af" }}>
          Preview
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: data.avatarUrl ? `url(${data.avatarUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!data.avatarUrl && (
              <span className="text-lg font-bold" style={{ color: "#9ca3af" }}>
                {(data.displayName || "?").slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <div className="text-[15px] font-bold truncate" style={{ color: "#0A1628" }}>
              {data.displayName || "Your Name"}
            </div>
            {data.headline && (
              <div className="text-[13px] truncate" style={{ color: "#6b7280" }}>
                {data.headline}
              </div>
            )}
            <div className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>
              tobe.fan/of/{data.username}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onContinue}
          className="h-12 px-8 rounded-xl text-[15px] font-semibold text-white flex items-center gap-2"
          style={{ backgroundColor: "#0C447C" }}
        >
          Looking good — continue <ArrowRight size={16} />
        </button>
        <button
          onClick={onContinue}
          className="text-[13px] font-medium"
          style={{ color: "#9ca3af" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
