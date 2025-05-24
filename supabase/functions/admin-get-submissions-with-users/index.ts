import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * This function serves as a replacement for the get_submissions_with_users RPC function
 * It fetches submissions with related user profile data for admin review
 */
Deno.serve(async (req: Request) => {
  // Only allow POST requests with proper authentication
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the Authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is authenticated and get their ID
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .single();

    if (adminError || !adminCheck) {
      return new Response(JSON.stringify({ error: 'Access denied: Only admins can access this function' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch submissions with user data
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          age,
          gender,
          city,
          organisation
        )
      `)
      .order('created_at', { ascending: false });

    if (submissionsError) {
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    // Transform the data to match the format expected by the frontend
    const formattedSubmissions = submissions.map(submission => {
      const profile = submission.profiles || {};
      
      return {
        id: submission.id,
        user_id: submission.user_id,
        video_url: submission.video_url,
        pull_up_count: submission.pull_up_count,
        actual_pull_up_count: submission.actual_pull_up_count,
        status: submission.status,
        notes: submission.notes,
        submitted_at: submission.submitted_at,
        approved_at: submission.approved_at,
        created_at: submission.created_at,
        updated_at: submission.updated_at,
        platform: submission.platform,
        email: profile.email,
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        region: profile.city,
        club_affiliation: profile.organisation
      };
    });

    return new Response(JSON.stringify(formattedSubmissions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error handling admin-get-submissions request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: 'Function execution failed', details: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 