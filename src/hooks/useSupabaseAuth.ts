import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  initials: string;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAuthUser = useCallback(async (supaUser: User): Promise<AuthUser | null> => {
    // Try to get username from profiles/users table
    let username = supaUser.user_metadata?.username || supaUser.email?.split("@")[0] || "user";
    try {
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("id", supaUser.id)
        .single();
      if (data?.username) username = data.username;
    } catch {
      // table may not exist yet, fall back
    }
    const initials = username.slice(0, 2).toUpperCase();
    return { id: supaUser.id, email: supaUser.email || "", username, initials };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildAuthUser(session.user);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildAuthUser(session.user);
        setUser(u);
      }
      setLoading(false);
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
      options: { data: { username } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, login, signup, logout };
}
