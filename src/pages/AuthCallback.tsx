import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // getSession() awaits supabase-js initialize(), which handles the PKCE
    // ?code= exchange automatically. Once it resolves, the session is set.
    supabase.auth.getSession().then(({ data: { session } }) => {
      navigate(session ? "/dashboard" : "/", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-[14px] text-ds-text-tertiary">Signing you in…</div>
    </div>
  );
};

export default AuthCallback;
