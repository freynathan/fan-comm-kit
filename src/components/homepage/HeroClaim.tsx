import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function HeroClaim() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleClaim = () => {
    if (username.trim()) {
      navigate(`/onboarding?username=${encodeURIComponent(username.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center rounded-lg border border-ds-border bg-white overflow-hidden h-12">
        <span className="pl-4 pr-1 text-[14px] text-ds-text-tertiary whitespace-nowrap select-none font-normal">
          tobe.fan/of/
        </span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleClaim()}
          placeholder="yourname"
          className="flex-1 h-full text-[14px] text-ds-text-primary font-normal bg-transparent border-none outline-none placeholder:text-ds-text-tertiary/50 px-0"
          style={{ border: 'none', padding: '0' }}
        />
        <button
          onClick={handleClaim}
          className="h-full px-5 text-[14px] font-medium text-ds-accent-text whitespace-nowrap bg-ds-accent hover:bg-ds-accent-hover transition-all active:scale-[0.98]"
        >
          Claim it free →
        </button>
      </div>
      <p className="text-center text-[13px] text-ds-text-tertiary mt-2.5 font-normal leading-[1.5]">
        Free forever. No credit card. No catch.
      </p>
    </div>
  );
}
