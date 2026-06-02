import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HeroImagePicker } from "@/components/admin/HeroImagePicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Trend = {
  id?: string;
  site_id: string | null;
  type: string;
  name: string;
  label: string | null;
  image_url: string | null;
  rank: number | null;
  status: string;
  active: boolean;
  content: string | null;
};

type Site = { id: string; name: string; slug: string };

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  trend: Trend | null;
  sites: Site[];
  defaultSiteId?: string | null;
  onSaved: () => void;
}

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

export function TrendEditorModal({ open, onOpenChange, trend, sites, defaultSiteId, onSaved }: Props) {
  const [form, setForm] = useState<Trend>({
    site_id: defaultSiteId ?? sites[0]?.id ?? null,
    type: "person",
    name: "",
    label: "",
    image_url: null,
    rank: 1,
    status: "approved",
    active: true,
    content: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trend) setForm(trend);
    else
      setForm({
        site_id: defaultSiteId ?? sites[0]?.id ?? null,
        type: "person",
        name: "",
        label: "",
        image_url: null,
        rank: 1,
        status: "approved",
        active: true,
        content: "",
      });
  }, [trend, open, defaultSiteId, sites]);

  const update = <K extends keyof Trend>(key: K, value: Trend[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.site_id) {
      toast.error("Name and site are required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        site_id: form.site_id,
        type: form.type,
        name: form.name.trim(),
        label: form.label?.trim() || null,
        image_url: form.image_url,
        rank: form.rank,
        status: form.status,
        active: form.active,
        content: form.content?.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (form.id) payload.id = form.id;
      const { error } = await supabase.from("trends" as never).upsert(payload as never);
      if (error) throw error;
      toast.success(form.id ? "Trend updated" : "Trend created");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Trend" : "New Trend"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left — image */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                {form.image_url ? (
                  <img src={form.image_url} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground">
                    {form.name ? initialsOf(form.name) : "?"}
                  </span>
                )}
              </div>
            </div>
            <HeroImagePicker
              current={form.image_url}
              onPick={(url) => update("image_url", url)}
            />
          </div>

          {/* Right — fields */}
          <div className="space-y-4">
            <div>
              <Label>Site</Label>
              <select
                value={form.site_id ?? ""}
                onChange={(e) => update("site_id", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              >
                <option value="person">Person</option>
                <option value="brand">Brand</option>
                <option value="trend">Trend</option>
                <option value="place">Place</option>
              </select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                value={form.label ?? ""}
                onChange={(e) => update("label", e.target.value)}
                placeholder="e.g. Red Carpet Shapeshifter"
              />
            </div>
            <div>
              <Label>Rank</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={form.rank ?? 1}
                onChange={(e) => update("rank", Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Status: {form.status}</Label>
              <Switch
                checked={form.status === "approved"}
                onCheckedChange={(c) => update("status", c ? "approved" : "pending")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(c) => update("active", c)} />
            </div>
            <div>
              <Label>Content (optional notes)</Label>
              <Textarea
                value={form.content ?? ""}
                onChange={(e) => update("content", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
