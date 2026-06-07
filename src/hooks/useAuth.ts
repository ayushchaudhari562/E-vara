import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface IdentityInfo {
  fullName: string;
  username: string;
  socialLink: string;
  keywords: string;
  faceImage: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (email: string, password: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Registration Successful", {
        description: "Please check your email for the verification link."
      });
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Login Successful", {
        description: "Establishing secure session..."
      });
      return null;
    } catch (err: any) {
      return err.message;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Local storage cleanup if any non-auth items exist
      localStorage.removeItem("evara-identity"); 
    } catch (err: any) {
      toast.error("Logout failed", { description: err.message });
    }
  };

  const getIdentity = useCallback((): IdentityInfo | null => {
    const data = localStorage.getItem("evara-identity");
    return data ? JSON.parse(data) : null;
  }, []);

  const saveIdentity = useCallback((info: IdentityInfo) => {
    localStorage.setItem("evara-identity", JSON.stringify(info));
  }, []);

  return { user, loading, register, login, logout, getIdentity, saveIdentity };
}
