import { useEffect, useRef } from "react";
import { User, Trophy, Wallet, Settings, LogOut } from "lucide-react";
import type { SiteMenuFeature } from "./types";

export interface AvatarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  siteName?: string;
  accentColor: string;
  siteMenuFeatures?: SiteMenuFeature[];
  onLogout: () => void;
}

const menuItemClass =
  "flex items-center gap-3 h-9 pl-3 pr-4 text-[13px] cursor-pointer rounded-md transition-colors hover:bg-gray-100";

export function AvatarDropdown({
  isOpen,
  onClose,
  username,
  siteName,
  accentColor,
  siteMenuFeatures = [],
  onLogout,
}: AvatarDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 min-w-[240px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
    >
      {/* Section 1 */}
      <div className="px-3 pt-1 pb-1">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
          My account
        </span>
      </div>
      <a href={`https://tobe.fan/of/${username}`} className={menuItemClass} style={{ color: "#0A1628" }}>
        <User size={16} strokeWidth={1.75} /> My profile
      </a>
      <a href="/my/clubs" className={menuItemClass} style={{ color: "#0A1628" }}>
        <Trophy size={16} strokeWidth={1.75} /> My fan clubs
      </a>
      <a href="/my/earnings" className={menuItemClass} style={{ color: "#0A1628" }}>
        <Wallet size={16} strokeWidth={1.75} /> My earnings & referrals
      </a>
      <a href="/my/settings" className={menuItemClass} style={{ color: "#0A1628" }}>
        <Settings size={16} strokeWidth={1.75} /> Settings
      </a>
      <div className="mx-3 my-1 border-t border-gray-100" />
      <button onClick={onLogout} className={`${menuItemClass} w-full`} style={{ color: "#0A1628" }}>
        <LogOut size={16} strokeWidth={1.75} /> Log out
      </button>

      {/* Section 2 — site-specific */}
      {siteMenuFeatures.length > 0 && (
        <>
          <div className="mx-3 my-1 border-t border-gray-100" />
          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: accentColor }}>
              {siteName}.fan
            </span>
          </div>
          {siteMenuFeatures.map((f) => (
            <a key={f.path} href={f.path} className={menuItemClass} style={{ color: "#0A1628" }}>
              <span>{f.icon}</span> {f.label}
            </a>
          ))}
        </>
      )}
    </div>
  );
}
