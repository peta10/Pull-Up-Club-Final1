import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Initialize Supabase client with service role key for admin access
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
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id);

    if (adminError || !adminCheck || adminCheck.length === 0) {
      return new Response(JSON.stringify({ error: 'Access denied: Only admins can access this function' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Get the request body
    const { user_id, action } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Add or remove the user from admin_roles based on the action
    if (action === 'remove') {
      // Remove admin role
      const { error: deleteError } = await supabaseAdmin
        .from('admin_roles')
        .delete()
        .eq('user_id', user_id);

      if (deleteError) {
        throw new Error(`Failed to remove admin role: ${deleteError.message}`);
      }

      return new Response(JSON.stringify({ success: true, message: `Admin role removed for user ${user_id}` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Add admin role (default action)
      const { error: insertError } = await supabaseAdmin
        .from('admin_roles')
        .insert({ user_id });

      if (insertError) {
        // Check if it's a unique constraint violation (user already an admin)
        if (insertError.code === '23505') {
          return new Response(JSON.stringify({ success: true, message: `User ${user_id} is already an admin` }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`Failed to add admin role: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ success: true, message: `User ${user_id} added as admin` }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in add-admin function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});