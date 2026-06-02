import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSupabaseAuth, type AuthUser } from "@/hooks/useSupabaseAuth";
import { AvatarDropdown } from "./AvatarDropdown";
import { AllSitesDropdown } from "./AllSitesDropdown";
import { AuthModal } from "./AuthModals";
import type { SharedHeaderProps } from "./types";
import tobeLogo from "@/assets/tobe-logo.png";
import { supabase } from "@/integrations/supabase/client";

const defaultNavLinks = (aiLabel: string) => [
  { label: "Feed", url: "/feed" },
  { label: "Discover", url: "/discover" },
  { label: "Fan clubs", url: "/dashboard/clubs" },
  { label: aiLabel, url: "/ai" },
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
    customNavLinks,
    logoUrl,
    demoUser,
    demoAvatarOpen,
  } = props;

  const isSiteMode = !!customNavLinks;
  const navItems = customNavLinks ?? defaultNavLinks(aiFeatureLabel);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  const { user: realUser, login, signup, logout } = useSupabaseAuth();
  const user = demoUser !== undefined ? demoUser : realUser;

  const [avatarOpen, setAvatarOpen] = useState(demoAvatarOpen ?? false);
  const [sitesOpen, setSitesOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;
      supabase
        .from("admins")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    });
  }, [user?.id]);

  useEffect(() => {
    if (openDropdownIdx === null) return;
    const close = () => setOpenDropdownIdx(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openDropdownIdx]);

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
          {isSiteMode ? (
            logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", maxWidth: 160, objectFit: "contain" }} />
            ) : (
              <span className="text-xl font-semibold" style={{ color: accentColor }}>
                {siteEmoji ? `${siteEmoji} ` : ""}{siteName}.fan
              </span>
            )
          ) : (
            <img src={tobeLogo} alt="ToBe.fan" style={{ height: 44, width: "auto" }} />
          )}
        </a>

        {/* CENTER — Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((l, idx) => {
            const hasDropdown = isSiteMode && (l.dropdown?.length ?? 0) > 0;
            if (hasDropdown) {
              return (
                <div key={l.label} className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenDropdownIdx(openDropdownIdx === idx ? null : idx); }}
                    className="flex items-center gap-1 text-[14px] font-normal text-ds-text-secondary transition-colors hover:text-ds-text-primary"
                  >
                    {l.label}
                    <ChevronDown size={14} className={`transition-transform ${openDropdownIdx === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openDropdownIdx === idx && (
                    <div
                      className="absolute left-0 top-full mt-2 min-w-[160px] rounded-xl border bg-white py-1 shadow-lg z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {l.dropdown!.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.url || "#"}
                          className="block px-4 py-2 text-[13px] text-ds-text-secondary hover:bg-muted hover:text-ds-text-primary"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <a
                key={l.label}
                href={l.url}
                className="text-[14px] font-normal text-ds-text-secondary transition-colors hover:text-ds-text-primary"
              >
                {l.label}
              </a>
            );
          })}

          {/* Network-wide fixed links — appended in site mode, part of default nav otherwise */}
          {isSiteMode && (
            <a
              href="/dashboard/clubs"
              className="text-[14px] font-normal text-ds-text-secondary transition-colors hover:text-ds-text-primary"
            >
              Fan Clubs
            </a>
          )}
          <button
            onClick={() => { setSitesOpen(!sitesOpen); setOpenDropdownIdx(null); }}
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
                  isAdmin={isAdmin}
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
