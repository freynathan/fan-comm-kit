import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSites } from "@/hooks/useDashboardData";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  FileText,
  Users,
  Newspaper,
  Plus,
  X,
  GripVertical,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "content" | "fan_clubs" | "posts";

interface LayoutBlock {
  uid: string;
  type: SectionType;
}

interface FanClubRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  member_count: number;
  is_free: boolean;
  accent_color: string | null;
}

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTION_TYPES: {
  type: SectionType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "content",
    label: "Content",
    description: "Rich text content block for editorial copy.",
    icon: <FileText size={18} strokeWidth={1.75} />,
  },
  {
    type: "fan_clubs",
    label: "Fan Clubs",
    description: "Fan clubs for this site — brands and passion communities.",
    icon: <Users size={18} strokeWidth={1.75} />,
  },
  {
    type: "posts",
    label: "Posts",
    description: "Latest approved posts from this site.",
    icon: <Newspaper size={18} strokeWidth={1.75} />,
  },
];

// ─── Section renderers ────────────────────────────────────────────────────────

function FanClubsSection({ siteId }: { siteId: string }) {
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["site-builder-fan-clubs", siteId],
    enabled: !!siteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fan_clubs")
        .select("id, name, slug, type, member_count, is_free, accent_color")
        .eq("site_id", siteId)
        .order("member_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FanClubRow[];
    },
  });

  if (!siteId) {
    return (
      <p className="text-[13px] text-ds-text-tertiary italic">
        Select a site above to preview fan clubs.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-[#F0F0F0] animate-pulse" />
        ))}
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <p className="text-[13px] text-ds-text-tertiary italic">
        No fan clubs found for this site yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {clubs.map((club) => {
        const accent = club.accent_color || "#0C447C";
        return (
          <div
            key={club.id}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"
            style={{ border: "0.5px solid hsl(var(--color-border))" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[14px] font-semibold shrink-0"
              style={{ backgroundColor: accent }}
            >
              {club.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#0A1628] truncate">{club.name}</p>
              <p className="text-[11px] text-ds-text-tertiary">
                {club.member_count} members ·{" "}
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: club.type === "brand" ? "#FEF3C7" : "#EEF2FF",
                    color: club.type === "brand" ? "#92400E" : "#3730A3",
                  }}
                >
                  {club.type === "brand" ? "Brand" : "Passion"}
                </span>
              </p>
            </div>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: club.is_free ? "#F5F5F7" : "#E8F3EC",
                color: club.is_free ? "#6B7280" : "#226B40",
              }}
            >
              {club.is_free ? "Free" : "Paid"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ContentSection() {
  return (
    <div
      className="rounded-xl px-4 py-3 text-[13px] text-ds-text-tertiary italic"
      style={{ border: "1px dashed hsl(var(--color-border))" }}
    >
      Content block — add rich text in the editor.
    </div>
  );
}

function PostsSection({ siteId }: { siteId: string }) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["site-builder-posts", siteId],
    enabled: !!siteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, excerpt")
        .eq("site_id", siteId)
        .in("status", ["approved", "published"])
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!siteId) {
    return (
      <p className="text-[13px] text-ds-text-tertiary italic">
        Select a site above to preview posts.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-[#F0F0F0] animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-[13px] text-ds-text-tertiary italic">
        No published posts for this site yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {posts.map((p) => (
        <li
          key={p.id}
          className="rounded-xl bg-white px-4 py-3"
          style={{ border: "0.5px solid hsl(var(--color-border))" }}
        >
          <p className="text-[13px] font-medium text-[#0A1628] leading-[1.4]">{p.title}</p>
          {p.excerpt && (
            <p className="mt-0.5 text-[12px] text-ds-text-tertiary line-clamp-1">{p.excerpt}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function renderSection(block: LayoutBlock, siteId: string) {
  switch (block.type) {
    case "fan_clubs":
      return <FanClubsSection siteId={siteId} />;
    case "posts":
      return <PostsSection siteId={siteId} />;
    case "content":
    default:
      return <ContentSection />;
  }
}

// ─── Add Section Modal ────────────────────────────────────────────────────────

function AddSectionModal({
  onAdd,
  onClose,
}: {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-xl"
        style={{ border: "0.5px solid hsl(var(--color-border))" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-[#0A1628] tracking-[-0.3px]">
            Add a section
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ds-text-tertiary hover:bg-[#F5F5F7] transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-2">
          {SECTION_TYPES.map((def) => (
            <button
              key={def.type}
              onClick={() => {
                onAdd(def.type);
                onClose();
              }}
              className="w-full flex items-start gap-4 rounded-xl p-4 text-left transition-colors hover:bg-[#F5F8FC]"
              style={{ border: "0.5px solid hsl(var(--color-border))" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[#0C447C]"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                {def.icon}
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#0A1628]">{def.label}</p>
                <p className="text-[12px] text-ds-text-tertiary mt-0.5">{def.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const AdminSiteBuilder = () => {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseAuth();
  const { data: sites = [] } = useSites();

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-check", user?.dbUserId],
    enabled: !!user?.dbUserId,
    queryFn: async () => {
      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user!.dbUserId!)
        .maybeSingle();
      return !!data;
    },
  });

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) navigate("/", { replace: true });
  }, [isAdmin, adminLoading, navigate]);

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const addBlock = (type: SectionType) => {
    setBlocks((prev) => [
      ...prev,
      { uid: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type },
    ]);
  };

  const removeBlock = (uid: string) => {
    setBlocks((prev) => prev.filter((b) => b.uid !== uid));
  };

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  if (loading || adminLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[14px] text-ds-text-tertiary">Loading…</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Site Builder — Admin</title>
      </Helmet>

      {modalOpen && (
        <AddSectionModal onAdd={addBlock} onClose={() => setModalOpen(false)} />
      )}

      <AdminLayout user={user}>
        <div className="max-w-[720px]">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0C447C] mb-1.5">
              Admin
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.6px] text-[#0A1628] leading-[1.15]">
              Site Builder
            </h1>
            <p className="text-[14px] text-ds-text-secondary mt-1.5">
              Build page layouts for each .fan site.
            </p>
          </div>

          {/* Site selector */}
          <div className="mb-8">
            <label className="block text-[13px] font-medium text-[#0A1628] mb-2">
              Site
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[13px] text-[#0A1628] bg-white focus:outline-none focus:ring-1 focus:ring-[#0C447C]"
              style={{ border: "0.5px solid hsl(var(--color-border-strong))" }}
            >
              <option value="">— Select a site —</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name} ({s.slug}.fan)
                </option>
              ))}
            </select>
          </div>

          {/* Layout canvas */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "0.5px solid hsl(var(--color-border))" }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderBottom: "0.5px solid hsl(var(--color-border))",
                backgroundColor: "#FAFAFB",
              }}
            >
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ds-text-tertiary">
                {selectedSite ? `${selectedSite.slug}.fan — layout` : "Page layout"}
              </p>
              <span className="text-[11px] text-ds-text-tertiary">
                {blocks.length} section{blocks.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {blocks.length === 0 ? (
                <div
                  className="rounded-xl px-6 py-10 text-center"
                  style={{ border: "1px dashed hsl(var(--color-border))" }}
                >
                  <p className="text-[13px] text-ds-text-tertiary">
                    No sections yet. Add your first section below.
                  </p>
                </div>
              ) : (
                blocks.map((block) => {
                  const def = SECTION_TYPES.find((d) => d.type === block.type)!;
                  return (
                    <div
                      key={block.uid}
                      className="rounded-xl overflow-hidden"
                      style={{ border: "0.5px solid hsl(var(--color-border))" }}
                    >
                      {/* Block header */}
                      <div
                        className="flex items-center gap-3 px-4 py-2.5"
                        style={{
                          borderBottom: "0.5px solid hsl(var(--color-border))",
                          backgroundColor: "#FAFAFB",
                        }}
                      >
                        <GripVertical
                          size={14}
                          strokeWidth={1.75}
                          className="text-ds-text-tertiary shrink-0 cursor-grab"
                        />
                        <div className="text-[#0C447C] shrink-0">{def.icon}</div>
                        <p className="flex-1 text-[13px] font-medium text-[#0A1628]">
                          {def.label}
                        </p>
                        <button
                          onClick={() => removeBlock(block.uid)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-ds-text-tertiary hover:bg-[#F5F5F7] transition-colors"
                          aria-label="Remove section"
                        >
                          <X size={13} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Block preview */}
                      <div className="px-4 py-4 bg-white">
                        {renderSection(block, selectedSiteId)}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add section button */}
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-medium text-[#0C447C] transition-colors hover:bg-[#F5F8FC]"
                style={{ border: "1px dashed #0C447C" }}
              >
                <Plus size={15} strokeWidth={2} />
                Add a section
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSiteBuilder;
