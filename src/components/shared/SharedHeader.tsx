import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSupabaseAuth, type AuthUser } from "@/hooks/useSupabaseAuth";
import { AvatarDropdown } from "./AvatarDropdown";
import { AllSitesDropdown } from "./AllSitesDropdown";
import { AuthModal } from "./AuthModals";
import type { SharedHeaderProps } from "./types";
import tobeLogo from "@/assets/tobe-logo.png";

const navLinks = (aiLabel: string) => [
  { label: "Feed", path: "/feed" },
  { label: "Discover", path: "/discover" },
  { label: "Fan clubs", path: "/clubs" },
  { label: aiLabel, path: "/ai" },
];

interface HeaderInternalProps extends SharedHeaderProps {
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

  // Auto-open auth modal when redirected here with ?auth=signup or ?auth=login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("auth");
    if ((requested === "signup" || requested === "login") && !realUser) {
      setAuthModal(requested);
      params.delete("auth");
      const newSearch = params.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, [realUser]);

  return (
    <header className="relative w-full bg-white" style={{ borderBottom: '0.5px solid hsl(var(--color-border))' }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-20 px-6">
        {/* LEFT — Logo */}
        <a href="/" className="flex items-center no-underline">
          <img
            src={tobeLogo}
            alt="ToBe.fan"
            style={{ height: 44, width: "auto" }}
          />
        </a>

        {/* CENTER — Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks(aiFeatureLabel).map((l) => (
            <a
              key={l.label}
              href={l.path}
              className="text-[14px] font-normal text-ds-text-secondary transition-colors hover:text-ds-text-primary"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => setSitesOpen(!sitesOpen)}
            className="flex items-center gap-1 text-[14px] font-normal text-ds-text-secondary transition-colors hover:text-ds-text-primary"
          >
            All sites <ChevronDown size={14} />
          </button>
        </nav>

        {/* RIGHT — Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-[13px] hidden sm:block font-normal text-ds-text-tertiary">
                tobe.fan/@{user.username}
              </span>
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center justify-center rounded-full text-xs font-medium text-ds-accent-text bg-ds-accent"
                  style={{ width: 36, height: 36 }}
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
                className="h-9 px-5 rounded-lg text-[14px] font-medium border border-ds-border-strong text-ds-text-primary transition-colors hover:border-ds-accent hover:text-ds-accent"
              >
                Log in
              </button>
              <button
                onClick={() => setAuthModal("signup")}
                className="h-9 px-5 rounded-lg text-[14px] font-medium text-ds-accent-text bg-ds-accent hover:bg-ds-accent-hover transition-all active:scale-[0.98]"
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
