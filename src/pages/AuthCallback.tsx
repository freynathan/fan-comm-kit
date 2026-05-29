import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // supabase-js detects ?code= and exchanges it automatically during initialize().
    // We wait for the SIGNED_IN event, then redirect to dashboard.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        subscription.unsubscribe();
        navigate("/dashboard", { replace: true });
      }
    });

    // Fallback: if no SIGNED_IN fires within 5s, go home.
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate("/", { replace: true });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-[14px] text-ds-text-tertiary">Signing you in…</div>
    </div>
  );
};

export default AuthCallback;
