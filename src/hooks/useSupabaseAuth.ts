import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  initials: string;
}

async function ensureUserRecord(supaUser: User): Promise<string | null> {
  // Returns the username for this auth user, creating user/profile rows if missing.
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("username")
      .eq("auth_id", supaUser.id)
      .maybeSingle();

    if (existing?.username) return existing.username;

    const metadata = supaUser.user_metadata ?? {};
    const seed: string =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      supaUser.email ||
      "user";

    const baseUsername =
      seed
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20) || "user";

    // Find an available username
    let username = baseUsername;
    let counter = 1;
    // Cap attempts to avoid infinite loop
    while (counter < 100) {
      const { data: taken } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (!taken) break;
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const displayName: string =
      metadata.full_name || metadata.name || username;
    const avatarUrl: string | null =
      metadata.avatar_url || metadata.picture || null;
    const initials = displayName
      .split(/\s+/)
      .map((p: string) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || username.slice(0, 2).toUpperCase();

    const { data: inserted, error: insertErr } = await supabase
      .from("users")
      .insert({
        auth_id: supaUser.id,
        email: supaUser.email ?? "",
        username,
        display_name: displayName,
        avatar_url: avatarUrl,
        initials,
      })
      .select("id, username")
      .single();

    if (insertErr || !inserted) {
      console.error("Failed to create user record:", insertErr);
      return null;
    }

    // Create empty profile row
    const { error: profileErr } = await supabase.from("profiles").insert({
      user_id: inserted.id,
      headline: null,
      bio: null,
      hire_available: false,
      verified: false,
    });
    if (profileErr) {
      console.error("Failed to create profile record:", profileErr);
    }

    // For new Google sign-ups, send to onboarding step 2
    const isOAuth = !!metadata.iss || !!metadata.picture || !!metadata.avatar_url;
    if (isOAuth && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== "/onboarding") {
        window.location.href = "/onboarding?step=2&source=google";
      }
    }

    return inserted.username;
  } catch (err) {
    console.error("ensureUserRecord error:", err);
    return null;
  }
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAuthUser = useCallback(async (supaUser: User): Promise<AuthUser | null> => {
    let username =
      supaUser.user_metadata?.username || supaUser.email?.split("@")[0] || "user";
    try {
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("auth_id", supaUser.id)
        .maybeSingle();
      if (data?.username) {
        username = data.username;
      } else {
        // No matching user row — auto-provision (handles Google/OAuth first sign-in)
        const created = await ensureUserRecord(supaUser);
        if (created) username = created;
      }
    } catch (err) {
      console.error("buildAuthUser error:", err);
    }
    const initials = username.slice(0, 2).toUpperCase();
    return { id: supaUser.id, email: supaUser.email || "", username, initials };
  }, []);

  useEffect(() => {
    // Set up listener FIRST — DO NOT await inside the callback (deadlock risk).
    // Defer all async Supabase work via setTimeout so the auth client can release its lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        setTimeout(() => {
          buildAuthUser(supaUser)
            .then((u) => setUser(u))
            .catch((err) => console.error("buildAuthUser failed:", err))
            .finally(() => setLoading(false));
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Then check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildAuthUser(session.user)
          .then((u) => setUser(u))
          .catch((err) => console.error("buildAuthUser failed:", err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [buildAuthUser]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, login, signup, logout };
}
