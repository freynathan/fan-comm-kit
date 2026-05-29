import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  dbUserId: string | null;
  email: string;
  username: string;
  initials: string;
}

const authUserResolutionCache = new Map<string, Promise<AuthUser>>();

function buildFallbackAuthUser(supaUser: User): AuthUser {
  const metadata = supaUser.user_metadata ?? {};
  const username =
    metadata.username ||
    metadata.preferred_username ||
    supaUser.email?.split("@")[0] ||
    "user";

  const seed = metadata.full_name || metadata.name || username;
  const initials =
    seed
      .toString()
      .split(/\s+/)
      .map((part: string) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || username.slice(0, 2).toUpperCase();

  return {
    id: supaUser.id,
    dbUserId: null,
    email: supaUser.email || "",
    username,
    initials,
  };
}

async function ensureUserRecord(supaUser: User): Promise<{ username: string; dbUserId: string } | null> {
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id, username")
      .eq("auth_id", supaUser.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id && existing?.username) {
      return { username: existing.username, dbUserId: existing.id };
    }

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

    let username = baseUsername;
    let counter = 1;

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

    const displayName: string = metadata.full_name || metadata.name || username;
    const avatarUrl: string | null = metadata.avatar_url || metadata.picture || null;
    const initials =
      displayName
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

    if (inserted?.username) {
      const { error: profileErr } = await supabase.from("profiles").insert({
        user_id: inserted.id,
        headline: null,
        bio: null,
        hire_available: false,
        verified: false,
      });

      if (profileErr && profileErr.code !== "23505") {
        console.error("Failed to create profile record:", profileErr);
      }

      const isOAuth = !!metadata.iss || !!metadata.picture || !!metadata.avatar_url;
      if (isOAuth && typeof window !== "undefined" && window.location.pathname !== "/onboarding") {
        window.location.href = "/onboarding?step=2&source=google";
      }

      return { username: inserted.username, dbUserId: inserted.id };
    }

    if (insertErr) {
      const { data: recovered } = await supabase
        .from("users")
        .select("id, username")
        .eq("auth_id", supaUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recovered?.id && recovered?.username) {
        return { username: recovered.username, dbUserId: recovered.id };
      }

      console.error("Failed to create user record:", insertErr);
    }

    return null;
  } catch (err) {
    console.error("ensureUserRecord error:", err);
    return null;
  }
}

async function resolveAuthUser(supaUser: User): Promise<AuthUser> {
  const cached = authUserResolutionCache.get(supaUser.id);
  if (cached) return cached;

  const promise = (async () => {
    const fallbackUser = buildFallbackAuthUser(supaUser);

    try {
      const { data } = await supabase
        .from("users")
        .select("id, username, initials")
        .eq("auth_id", supaUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.username) {
        return {
          ...fallbackUser,
          dbUserId: data.id,
          username: data.username,
          initials: data.initials || fallbackUser.initials,
        };
      }
    } catch (err) {
      console.error("resolveAuthUser error:", err);
    }

    return fallbackUser;
  })().finally(() => {
    authUserResolutionCache.delete(supaUser.id);
  });

  authUserResolutionCache.set(supaUser.id, promise);
  return promise;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionUser = useCallback((supaUser: User | null) => {
    if (!supaUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(buildFallbackAuthUser(supaUser));
    setLoading(false);

    void resolveAuthUser(supaUser)
      .then((resolvedUser) => {
        setUser((current) => (current?.id === supaUser.id ? resolvedUser : current));
      })
      .catch((err) => console.error("resolveAuthUser failed:", err));
  }, []);

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!active) return;
        syncSessionUser(session?.user ?? null);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      syncSessionUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [syncSessionUser]);

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
