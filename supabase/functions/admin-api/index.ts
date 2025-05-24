import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Admin API Edge Function that handles multiple admin operations
 * using URL-based routing to reduce cold starts
 */
Deno.serve(async (req: Request) => {
  // Enable CORS for browser requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Extract route from URL
  const url = new URL(req.url);
  const route = url.pathname.split('/').pop() || '';
  
  // Only allow POST requests with proper authentication
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Get the Authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user is authenticated and get their ID
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired token', 
        details: userError?.message || 'Authentication failed'
      }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .single();

    if (adminError || !adminCheck) {
      return new Response(JSON.stringify({ 
        error: 'Access denied: Only admins can access this function',
        details: adminError?.message || 'User is not an admin'
      }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Route to appropriate handler based on the route
    let response;
    switch (route) {
      case 'get-submissions':
        response = await handleGetSubmissions();
        break;
      
      case 'approve-submission':
        response = await handleApproveSubmission(req);
        break;
      
      case 'reject-submission':
        response = await handleRejectSubmission(req);
        break;
      
      case 'get-users':
        response = await handleGetUsers();
        break;
      
      case 'get-stats':
        response = await handleGetStats();
        break;
      
      default:
        response = new Response(JSON.stringify({ error: 'Unknown route' }), {
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
    }

    // Add CORS headers to the response
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error(`Error handling admin-api request to ${route}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Function execution failed', 
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

/**
 * Handler for getting all submissions with user data
 */
async function handleGetSubmissions(): Promise<Response> {
  try {
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

    if (!submissions) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
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
  } catch (error) {
    console.error('Error in handleGetSubmissions:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get submissions',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handler for approving a submission
 */
async function handleApproveSubmission(req: Request): Promise<Response> {
  try {
    const { submissionId, actualCount } = await req.json();
    
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'Missing submissionId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({
        status: 'approved',
        actual_pull_up_count: actualCount || null,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      throw new Error(`Failed to approve submission: ${updateError.message}`);
    }

    // Get the updated submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('id', submissionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch updated submission: ${fetchError.message}`);
    }

    // Optionally, trigger email notification about approval
    try {
      // Logic to send approval notification to user
      // This could be a call to another function or direct email sending
    } catch (notificationError) {
      console.error('Failed to send approval notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return new Response(JSON.stringify({ success: true, submission }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleApproveSubmission:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to approve submission',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handler for rejecting a submission
 */
async function handleRejectSubmission(req: Request): Promise<Response> {
  try {
    const { submissionId, notes } = await req.json();
    
    if (!submissionId) {
      return new Response(JSON.stringify({ error: 'Missing submissionId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update({
        status: 'rejected',
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      throw new Error(`Failed to reject submission: ${updateError.message}`);
    }

    // Get the updated submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('id', submissionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch updated submission: ${fetchError.message}`);
    }

    // Optionally, trigger email notification about rejection
    try {
      // Logic to send rejection notification to user
      // This could be a call to another function or direct email sending
    } catch (notificationError) {
      console.error('Failed to send rejection notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return new Response(JSON.stringify({ success: true, submission }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleRejectSubmission:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to reject submission',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handler for getting all users
 */
async function handleGetUsers(): Promise<Response> {
  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    return new Response(JSON.stringify(users || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleGetUsers:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get users',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handler for getting admin dashboard stats
 */
async function handleGetStats(): Promise<Response> {
  try {
    // Get counts of submissions by status
    const { data: submissionStats, error: submissionStatsError } = await supabaseAdmin
      .rpc('get_submission_stats');

    if (submissionStatsError) {
      throw new Error(`Failed to fetch submission stats: ${submissionStatsError.message}`);
    }

    // Get user stats
    const { data: userCount, error: userCountError } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (userCountError) {
      throw new Error(`Failed to fetch user count: ${userCountError.message}`);
    }

    // Get subscription stats
    const { data: subscriptionStats, error: subscriptionStatsError } = await supabaseAdmin
      .rpc('get_subscription_stats');

    if (subscriptionStatsError) {
      throw new Error(`Failed to fetch subscription stats: ${subscriptionStatsError.message}`);
    }

    const stats = {
      submissions: submissionStats || { pending: 0, approved: 0, rejected: 0, total: 0 },
      users: {
        total: userCount || 0,
        paid: 0, // This would come from the subscription stats
        free: 0, // This would come from the subscription stats
      },
      subscriptions: subscriptionStats || { active: 0, past_due: 0, canceled: 0, total: 0 }
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in handleGetStats:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get stats',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 