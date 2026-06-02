import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ContentPanel } from "@/pages/DashboardContent";

export default function AdminContentPage() {
  const { user, loading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-ds-text-tertiary" size={20} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Content pipeline · Admin</title>
      </Helmet>
      <AdminLayout user={user}>
        <ContentPanel />
      </AdminLayout>
    </>
  );
}
