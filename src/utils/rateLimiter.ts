import { supabase } from "@/integrations/supabase/client";

/**
 * Evaluates request allowance against a Supabase sliding window configuration.
 * @param identifier Unique client key (e.g., ip address, user account hash, email)
 * @param maxRequests Max requests permitted inside the frame
 * @param windowSeconds Duration of the rate limit frame in seconds
 */
export async function isRateLimited(
  identifier: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; currentLimit: number }> {
  try {
    // Invoke the optimized PL/pgSQL function securely via RPC
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) throw error;

    return {
      allowed: !!data,
      currentLimit: maxRequests,
    };
  } catch (error) {
    console.error("Rate limiting engine error:", error);
    // Fail-safe open: let transactions process if the tracking pool goes down temporarily
    return { allowed: true, currentLimit: maxRequests };
  }
}
