import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Camera, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";

interface ProfileFormData {
  display_name: string;
  headline: string;
  bio: string;
  location: string;
  hire_available: boolean;
}

interface SocialLinkRow {
  id?: string;
  platform: string;
  handle: string;
  url: string;
  follower_count: number;
  display_order: number;
}

const PLATFORMS = ["YouTube", "Instagram", "TikTok", "LinkedIn", "X/Twitter"];

export default function ProfileEdit() {
  const { user: authUser, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("??");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState<ProfileFormData>({
    display_name: "",
    headline: "",
    bio: "",
    location: "",
    hire_available: false,
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate("/");
    }
  }, [authLoading, authUser, navigate]);

  // Load existing data
  useEffect(() => {
    if (!authUser) return;

    async function load() {
      setLoadingData(true);

      // Get user row
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser!.id)
        .maybeSingle();

      if (!userData) {
        setLoadingData(false);
        return;
      }

      setDbUserId(userData.id);
      setUsername(userData.username);
      setAvatarUrl(userData.avatar_url);
      setInitials(userData.initials || userData.username.slice(0, 2).toUpperCase());

      setForm((prev) => ({
        ...prev,
        display_name: userData.display_name || "",
      }));

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.id)
        .maybeSingle();

      if (profileData) {
        setForm({
          display_name: userData.display_name || "",
          headline: profileData.headline || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          hire_available: profileData.hire_available,
        });
      }

      // Get social links
      const { data: linksData } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", userData.id)
        .order("display_order");

      if (linksData && linksData.length > 0) {
        setSocialLinks(
          linksData.map((l) => ({
            id: l.id,
            platform: l.platform,
            handle: l.handle || "",
            url: l.url || "",
            follower_count: l.follower_count,
            display_order: l.display_order,
          }))
        );
      }

      setLoadingData(false);
    }

    load();
  }, [authUser]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${authUser.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = publicUrl.publicUrl + "?t=" + Date.now();

    await supabase.from("users").update({ avatar_url: url }).eq("auth_id", authUser.id);
    setAvatarUrl(url);
    setUploading(false);
    toast({ title: "Avatar updated" });
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { platform: "YouTube", handle: "", url: "", follower_count: 0, display_order: prev.length },
    ]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLinkRow, value: string | number) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const handleSave = async () => {
    if (!dbUserId || !authUser) return;
    setSaving(true);

    try {
      // Update users table
      const newInitials = (form.display_name || username).slice(0, 2).toUpperCase();
      await supabase
        .from("users")
        .update({ display_name: form.display_name || null, initials: newInitials })
        .eq("id", dbUserId);

      // Upsert profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", dbUserId)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("profiles")
          .update({
            headline: form.headline || null,
            bio: form.bio || null,
            location: form.location || null,
            hire_available: form.hire_available,
          })
          .eq("user_id", dbUserId);
      } else {
        await supabase.from("profiles").insert({
          user_id: dbUserId,
          headline: form.headline || null,
          bio: form.bio || null,
          location: form.location || null,
          hire_available: form.hire_available,
        });
      }

      // Sync social links — delete removed, upsert current
      const { data: existingLinks } = await supabase
        .from("social_links")
        .select("id")
        .eq("user_id", dbUserId);

      const currentIds = socialLinks.filter((l) => l.id).map((l) => l.id!);
      const toDelete = (existingLinks || []).filter((l) => !currentIds.includes(l.id));

      for (const d of toDelete) {
        await supabase.from("social_links").delete().eq("id", d.id);
      }

      for (let i = 0; i < socialLinks.length; i++) {
        const link = socialLinks[i];
        const payload = {
          user_id: dbUserId,
          platform: link.platform,
          handle: link.handle || null,
          url: link.url || null,
          follower_count: Number(link.follower_count) || 0,
          display_order: i,
        };

        if (link.id) {
          await supabase.from("social_links").update(payload).eq("id", link.id);
        } else {
          const { data } = await supabase.from("social_links").insert(payload).select("id").single();
          if (data) {
            setSocialLinks((prev) =>
              prev.map((l, idx) => (idx === i ? { ...l, id: data.id } : l))
            );
          }
        }
      }

      toast({ title: "Profile saved!" });
      navigate(`/of/${username}`);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Profile — tobe.fan</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Back link */}
          <button
            onClick={() => navigate(`/of/${username}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to profile
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-8">Edit profile</h1>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-10">
            <div className="relative">
              <Avatar className="h-24 w-24 border-[3px] border-primary">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="text-xs text-muted-foreground">Click the camera icon to upload</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-5 mb-10">
            <div>
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Your name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Travel creator & food blogger"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell your story..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. London, UK"
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Available for hire</p>
                <p className="text-xs text-muted-foreground">Show a "Hire" button on your profile</p>
              </div>
              <Switch
                checked={form.hire_available}
                onCheckedChange={(checked) => setForm({ ...form, hire_available: checked })}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Social links</h2>
              <Button variant="outline" size="sm" onClick={addSocialLink}>
                <Plus size={14} /> Add
              </Button>
            </div>

            {socialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No social links yet. Add your accounts to show your reach.
              </p>
            )}

            <div className="space-y-4">
              {socialLinks.map((link, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                      className="text-sm font-medium bg-transparent border border-input rounded-md px-2 py-1.5 text-foreground"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeSocialLink(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Handle</Label>
                      <Input
                        value={link.handle}
                        onChange={(e) => updateSocialLink(i, "handle", e.target.value)}
                        placeholder="@username"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Followers</Label>
                      <Input
                        type="number"
                        value={link.follower_count || ""}
                        onChange={(e) => updateSocialLink(i, "follower_count", e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Profile URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pb-16">
            <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/of/${username}`)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
