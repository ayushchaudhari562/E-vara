import { supabase, isSimulationMode } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const STORAGE_KEY = 'evara-local-findings';

const mockFindings = [
  {
    id: '1',
    severity: 'high',
    title: 'Identity Compromised: LinkedIn 2021',
    source: 'Dark Web Leak',
    description: 'User email and password hash found in a verified dataset. Recommended action: Rotate credentials.',
    found_at: new Date().toISOString()
  },
  {
    id: '2',
    severity: 'medium',
    title: 'Partial Identity Match: GitHub Metadata',
    source: 'Public OSINT',
    description: 'Reused handle detected across 3 social platforms with linked profile markers.',
    found_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const useThreatMonitor = () => {
  return useQuery({
    queryKey: ["threat-findings"],
    queryFn: async () => {
      if (isSimulationMode) {
        const local = localStorage.getItem(STORAGE_KEY);
        return local ? JSON.parse(local) : mockFindings;
      }

      try {
        const { data, error } = await supabase
          .from('threat_findings' as any)
          .select('*')
          .order('found_at', { ascending: false });
        
        if (error) throw error;
        
        const results = data || [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        return results;
      } catch (err) {
        console.warn('Supabase unreachable, using local intelligence cache');
        const local = localStorage.getItem(STORAGE_KEY);
        return local ? JSON.parse(local) : mockFindings;
      }
    },
    staleTime: 30000, // 30 seconds cache
  });
};
