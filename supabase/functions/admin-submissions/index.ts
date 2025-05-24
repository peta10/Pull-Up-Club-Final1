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

interface UpdateSubmissionRequest {
  submissionId: string;
  status: 'approved' | 'rejected';
  actualPullUpCount?: number;
  notes?: string;
}

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
      // List submissions with user details
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || 'pending';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = 10;
      const offset = (page - 1) * limit;

      const { data: submissions, error: queryError } = await supabaseAdmin
        .from('submissions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            organisation
          )
        `)
        .eq('status', status)
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (queryError) throw queryError;

      return new Response(
        JSON.stringify({ data: submissions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'POST') {
      // Update submission status
      const { submissionId, status, actualPullUpCount, notes }: UpdateSubmissionRequest = await req.json();

      if (!submissionId || !status) {
        throw new Error('Missing required fields');
      }

      if (status === 'approved' && typeof actualPullUpCount !== 'number') {
        throw new Error('Actual pull-up count required for approval');
      }

      const updateData: Record<string, unknown> = {
        status,
        notes,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.actual_pull_up_count = actualPullUpCount;
        updateData.approved_at = new Date().toISOString();
      }

      const { data: submission, error: updateError } = await supabaseAdmin
        .from('submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          message: `Submission ${status} successfully`,
          data: submission 
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