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
      <div className="flex items-center rounded-xl border border-[hsl(var(--grey-border))] bg-white overflow-hidden h-12 shadow-sm">
        <span className="pl-4 pr-1 text-[14px] text-[hsl(var(--grey-text))] whitespace-nowrap select-none font-medium">
          tobe.fan/of/
        </span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleClaim()}
          placeholder="yourname"
          className="flex-1 h-full text-[14px] text-[hsl(var(--navy))] font-medium bg-transparent border-none outline-none placeholder:text-[hsl(var(--grey-text))]/50"
        />
        <button
          onClick={handleClaim}
          className="h-full px-5 text-[13px] font-semibold text-white whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#0C447C" }}
        >
          Claim it free →
        </button>
      </div>
      <p className="text-center text-[12px] text-[hsl(var(--grey-text))] mt-2.5">
        Free forever. No credit card. No catch.
      </p>
    </div>
  );
}
