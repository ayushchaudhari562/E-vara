import { useCallback } from "react";
import { supabase, isSimulationMode } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sha256 } from "@/lib/crypto";

export type SubscriptionTier = 'tactical' | 'executive' | 'omni';

export interface IdentityInfo {
  fullName: string;
  username: string;
  email: string;
  faceImage: string | null;
}

export interface UserProfile {
  tier: SubscriptionTier;
  node_id_stable: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // 1. Unified Session Query
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Secure Profile & Tier Query (Source of Truth for Authorization)
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;
      if (isSimulationMode) return { tier: 'executive', node_id_stable: `NODE-${user.id.substring(0, 8).toUpperCase()}` };

      const { data, error } = await supabase
        .from('user_profiles' as any)
        .select('tier, node_id_stable')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Critical: Failed to verify subscription tier.");
        return { tier: 'tactical', node_id_stable: "NODE_AUTH_PENDING" };
      }
      return data as UserProfile;
    },
    enabled: !!user,
  });

  // 3. Identity Query (Fetch PII from Database)
  const { data: identity, isLoading: loadingIdentity } = useQuery({
    queryKey: ["identity", user?.id],
    queryFn: async (): Promise<IdentityInfo | null> => {
      if (!user) return null;
      if (isSimulationMode) {
         const local = localStorage.getItem(`evara-identity-${user.id}`);
         return local ? JSON.parse(local) : null;
      }
      
      const { data, error } = await supabase
        .from('monitored_identities' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? {
        fullName: (data as any).full_name || "",
        username: (data as any).identity_value_encrypted || "",
        email: (data as any).identity_value_encrypted || "",
        faceImage: null
      } : null;
    },
    enabled: !!user,
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    toast.success("Session Terminated");
  }, [queryClient]);

  const saveIdentity = useCallback(async (info: IdentityInfo) => {
    if (!user) return;
    
    // ENFORCE CRYPTOGRAPHIC INTEGRITY: Hash before ingestion
    const hashedEmail = await sha256(info.email);

    if (isSimulationMode) {
       localStorage.setItem(`evara-identity-${user.id}`, JSON.stringify(info));
    } else {
       const { error } = await supabase.from('monitored_identities' as any).upsert({
         user_id: user.id,
         identity_type: 'email',
         identity_value_encrypted: info.email,
         identity_hash: hashedEmail, // ACTUAL SHA-256 ENFORCED
         full_name: info.fullName,
         is_active: true
       } as any);
       if (error) throw error;
    }
    
    queryClient.invalidateQueries({ queryKey: ["identity", user.id] });
  }, [user, queryClient]);

  return { 
    user, 
    profile,
    identity,
    loading: loading || loadingIdentity, 
    login: (e: string, p: string) => supabase.auth.signInWithPassword({ email: e, password: p }),
    register: (e: string, p: string) => supabase.auth.signUp({ email: e, password: p }),
    logout, 
    saveIdentity 
  };
}
