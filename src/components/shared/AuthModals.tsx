import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  mode: "login" | "signup";
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, username: string) => Promise<void>;
}

export function AuthModal({ isOpen, onClose, accentColor, mode, onLogin, onSignup }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onSignup(email, password, username);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-6" style={{ color: "#0A1628" }}>
          {mode === "login" ? "Log in" : "Create your account"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? "..." : mode === "login" ? "Continue" : "Create my account"}
          </button>
        </form>
      </div>
    </div>
  );
}
