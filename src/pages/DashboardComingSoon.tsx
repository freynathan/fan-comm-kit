import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardComingSoon() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section") ?? "This feature";
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/?auth=signup", { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{section} — ToBe.fan</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Clock size={40} strokeWidth={1.5} className="text-ds-text-tertiary mb-5 opacity-40" />
          <h1 className="text-[28px] font-semibold text-[#0A1628] tracking-[-0.4px]">
            {section}
          </h1>
          <p className="text-[15px] text-ds-text-tertiary mt-2">
            This feature is coming soon.
          </p>
        </div>
      </DashboardLayout>
    </>
  );
}
