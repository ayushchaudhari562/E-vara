import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail-fast in development if env vars are missing
if (import.meta.env.DEV && (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY)) {
  console.error("E-VARA: Critical Infrastructure Missing. VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || "https://simulation-node.e-vara.io", 
  SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulation"
);

/**
 * Health check to verify if the infrastructure is reachable.
 */
export const checkInfrastructure = async (): Promise<boolean> => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const { error } = await supabase.from('monitored_identities').select('count', { count: 'exact', head: true }).limit(1);
    return !error;
  } catch {
    return false;
  }
};
