import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Initialize Supabase client with service role key
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
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!user) {
      throw new Error('No user found');
    }

    // Check if user is admin
    const { data: adminRole, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
      throw new Error(`Profile error: ${profileError.message}`);
    }

    // Check subscription status
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Get submission status
    const { data: submissionStatus } = await supabaseAdmin.rpc(
      'get_submission_status',
      { user_id: user.id }
    );

    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: !!adminRole,
      },
      profile: profile || null,
      hasProfile: !!profile,
      isProfileComplete: profile?.is_profile_completed || false,
      hasSubscription: !!subscription,
      submissionStatus,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('Authentication error') ? 401 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      authenticated: false 
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});