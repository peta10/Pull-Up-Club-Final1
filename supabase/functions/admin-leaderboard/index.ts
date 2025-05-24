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

async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admin_roles')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  return !error && data !== null;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Verify admin status
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      throw new Error('Unauthorized: Admin access required');
    }

    if (req.method === 'GET') {
      // Get leaderboard with filters
      const { searchParams } = new URL(req.url);
      const gender = searchParams.get('gender');
      const organisation = searchParams.get('organisation');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');
      const includeBadges = searchParams.get('includeBadges') !== 'false';

      // Call the get_leaderboard function
      const { data: leaderboard, error: queryError } = await supabaseAdmin.rpc(
        'get_leaderboard',
        {
          p_gender: gender,
          p_organisation: organisation,
          p_limit: limit,
          p_offset: offset
        }
      );

      if (queryError) throw queryError;

      // Get badge statistics if requested
      if (includeBadges) {
        const { data: badgeStats, error: badgeError } = await supabaseAdmin
          .from('badges')
          .select(`
            id,
            name,
            description,
            image_url,
            min_pull_ups,
            gender,
            user_count:user_badges(count)
          `)
          .order('min_pull_ups', { ascending: true });

        if (badgeError) throw badgeError;

        return new Response(
          JSON.stringify({ 
            data: leaderboard,
            badges: badgeStats
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: leaderboard }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'POST') {
      // Force refresh leaderboard
      const { data, error } = await supabaseAdmin.rpc('refresh_leaderboard');
      
      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          message: 'Leaderboard refreshed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes('Unauthorized') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 