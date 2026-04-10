import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSupabaseAuth, type AuthUser } from "@/hooks/useSupabaseAuth";
import { AvatarDropdown } from "./AvatarDropdown";
import { AllSitesDropdown } from "./AllSitesDropdown";
import { AuthModal } from "./AuthModals";
import type { SharedHeaderProps } from "./types";

const navLinks = (aiLabel: string) => [
  { label: "Feed", path: "/feed" },
  { label: "Discover", path: "/discover" },
  { label: "Fan clubs", path: "/clubs" },
  { label: aiLabel, path: "/ai" },
];

interface HeaderInternalProps extends SharedHeaderProps {
  /** For demo purposes: override auth state */
  demoUser?: AuthUser | null;
  demoAvatarOpen?: boolean;
}

export function SharedHeader(props: HeaderInternalProps) {
  const {
    siteName,
    siteEmoji,
    accentColor,
    aiFeatureLabel,
    siteMenuFeatures,
    demoUser,
    demoAvatarOpen,
  } = props;

  const { user: realUser, login, signup, logout } = useSupabaseAuth();
  const user = demoUser !== undefined ? demoUser : realUser;

  const [avatarOpen, setAvatarOpen] = useState(demoAvatarOpen ?? false);
  const [sitesOpen, setSitesOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  return (
    <header className="relative w-full bg-white" style={{ borderBottom: "1px solid #eee" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
        {/* LEFT — Logo */}
        <a href="/" className="flex items-center gap-2 no-underline">
          <span
            className="flex items-center justify-center rounded-lg text-lg"
            style={{ width: 36, height: 36, backgroundColor: accentColor }}
          >
            {siteEmoji}
          </span>
          <span className="text-[15px] font-bold" style={{ color: "#0A1628" }}>
            {siteName}
            <span style={{ color: accentColor }}>.fan</span>
          </span>
        </a>

        {/* CENTER — Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks(aiFeatureLabel).map((l) => (
            <a
              key={l.label}
              href={l.path}
              className="text-[13px] font-medium transition-colors hover:text-[#0A1628]"
              style={{ color: "#6b7280" }}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setSitesOpen(!sitesOpen)}
            className="flex items-center gap-1 text-[13px] font-medium transition-colors hover:text-[#0A1628]"
            style={{ color: "#6b7280" }}
          >
            All sites <ChevronDown size={14} />
          </button>
        </nav>

        {/* RIGHT — Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-[12px] hidden sm:block" style={{ color: "#6b7280" }}>
                tobe.fan/@{user.username}
              </span>
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ width: 36, height: 36, backgroundColor: accentColor }}
                >
                  {user.initials}
                </button>
                <AvatarDropdown
                  isOpen={avatarOpen}
                  onClose={() => setAvatarOpen(false)}
                  username={user.username}
                  siteName={siteName}
                  accentColor={accentColor}
                  siteMenuFeatures={siteMenuFeatures}
                  onLogout={logout}
                />
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModal("login")}
                className="h-9 px-4 rounded-lg text-[13px] font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: "#d1d5db", color: "#374151" }}
              >
                Log in
              </button>
              <button
                onClick={() => setAuthModal("signup")}
                className="h-9 px-4 rounded-lg text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Join free
              </button>
            </>
          )}
        </div>
      </div>

      <AllSitesDropdown isOpen={sitesOpen} onClose={() => setSitesOpen(false)} currentSite={siteName} accentColor={accentColor} />

      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        mode={authModal ?? "login"}
        accentColor={accentColor}
        onLogin={login}
        onSignup={signup}
      />
    </header>
  );
}
