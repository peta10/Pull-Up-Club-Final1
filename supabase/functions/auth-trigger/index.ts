import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AuthTriggerPayload {
  record: {
    id: string;
    email: string;
    raw_app_meta_data: {
      metadata?: {
        full_name?: string;
        phone?: string;
        age?: string;
        gender?: string;
        organization?: string;
        region?: string;
        social_media?: string;
        stripe_customer_id?: string;
        is_paid?: boolean;
      };
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: AuthTriggerPayload = await req.json();
    const { id, email, raw_app_meta_data } = payload.record;
    const metadata = raw_app_meta_data?.metadata || {};

    // Insert into profiles table with all metadata
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: metadata.full_name,
        phone: metadata.phone,
        age: metadata.age ? parseInt(metadata.age) : null,
        gender: metadata.gender,
        organization: metadata.organization,
        region: metadata.region,
        social_media: metadata.social_media,
        stripe_customer_id: metadata.stripe_customer_id,
        is_paid: metadata.is_paid || false,
        is_profile_completed: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 