import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Check if user is admin
    const { data: adminRole, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminRole) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Parse request
    const { pathname, searchParams } = new URL(req.url);
    const path = pathname.split('/').pop();

    let data;
    let error;

    // Route to appropriate analytics function
    switch (path) {
      case 'distribution':
        ({ data, error } = await supabaseAdmin.rpc('get_badge_distribution'));
        break;

      case 'achievement-rates':
        const timeWindow = searchParams.get('timeWindow') || '30 days';
        ({ data, error } = await supabaseAdmin.rpc('get_achievement_rates', { 
          p_time_window: timeWindow 
        }));
        break;

      case 'time-to-achievement':
        ({ data, error } = await supabaseAdmin.rpc('get_time_to_achievement_metrics'));
        break;

      case 'gender-analysis':
        ({ data, error } = await supabaseAdmin.rpc('get_gender_badge_analysis'));
        break;

      case 'organization-performance':
        ({ data, error } = await supabaseAdmin.rpc('get_organization_badge_performance'));
        break;

      case 'summary':
        ({ data, error } = await supabaseAdmin
          .from('badge_analytics_summary')
          .select('*'));
        break;

      default:
        throw new Error('Invalid analytics endpoint');
    }

    if (error) throw error;

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: error.message.includes('Unauthorized') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 