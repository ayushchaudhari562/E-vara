import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { identityId, identityValue, userId } = await req.json()

    // Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // TIER ENFORCEMENT: Server-side check
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', userId)
      .single()

    const maxResults = profile?.tier === 'omni' ? 50 : profile?.tier === 'executive' ? 10 : 2
    console.log(`Node authorized for ${profile?.tier} tier. Max analysis limit: ${maxResults}`)

    const HIBP_KEY = Deno.env.get('HIBP_API_KEY');
    let breaches = [];

    if (HIBP_KEY) {
       const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${identityValue}`, {
          headers: { 'hibp-api-key': HIBP_KEY, 'user-agent': 'E-Vara-Audit-Engine' }
       });
       if (response.status === 200) {
          const data = await response.json();
          breaches = data.slice(0, maxResults).map((b: any) => ({
             source_name: b.Name,
             leak_date: b.BreachDate,
             severity: b.PwnCount > 1000000 ? 'critical' : 'high',
             data_types: b.DataClasses,
             description: b.Description
          }));
       }
    } else {
       // ALGORITHMIC HONESTY: Synthetic Intelligence Samples
       // Explicitly labeled as simulation to prevent consumer fraud liability.
       breaches = [
         {
           source_name: "[SYNTHETIC_INTEL] Public Metadata Correlation",
           leak_date: new Date().toISOString().split('T')[0],
           severity: "medium",
           data_types: ["email_alias", "domain_origin"],
           description: "THIS IS A SYNTHETIC INTELLIGENCE SAMPLE. In a production environment, this node would link to verified leak repositories (HIBP, DeHashed)."
         }
       ];
    }

    for (const breach of breaches) {
      await supabase.from('identity_breaches').insert({
        identity_id: identityId,
        ...breach
      })
    }

    const risk_score = breaches.length > 0 ? 65 : 12;
    await supabase.from('monitored_identities')
      .update({ risk_score, last_scanned_at: new Date().toISOString() })
      .eq('id', identityId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: breaches.length,
        message: `Intelligence scan complete using ${HIBP_KEY ? 'Real-Time OSINT' : 'Synthetic Samples'}.` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
