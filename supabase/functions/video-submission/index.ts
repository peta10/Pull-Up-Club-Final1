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

interface SubmissionRequest {
  videoUrl: string;
  pullUpCount: number;
}

// Validate video URL format
function validateVideoUrl(url: string): { isValid: boolean; platform: string | null } {
  try {
    const videoUrl = new URL(url);
    
    // YouTube URL patterns
    if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
      return { isValid: true, platform: 'youtube' };
    }
    
    // TikTok URL pattern
    if (videoUrl.hostname.includes('tiktok.com')) {
      return { isValid: true, platform: 'tiktok' };
    }

    // Instagram URL pattern
    if (videoUrl.hostname.includes('instagram.com')) {
      return { isValid: true, platform: 'instagram' };
    }

    return { isValid: false, platform: null };
  } catch {
    return { isValid: false, platform: null };
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Parse request body
    const { videoUrl, pullUpCount }: SubmissionRequest = await req.json();

    // Validate required fields
    if (!videoUrl || typeof pullUpCount !== 'number') {
      throw new Error('Missing or invalid required fields');
    }

    // Validate video URL
    const { isValid, platform } = validateVideoUrl(videoUrl);
    if (!isValid) {
      throw new Error('Invalid video URL. Please provide a valid YouTube, TikTok, or Instagram URL.');
    }

    // Check if user is eligible to submit (cooldown period)
    const { data: isEligible } = await supabaseAdmin.rpc('user_can_submit');
    if (!isEligible) {
      throw new Error('You are not eligible to submit yet. Please wait for the cooldown period to end.');
    }

    // Create submission record
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert({
        user_id: user.id,
        video_url: videoUrl,
        pull_up_count: pullUpCount,
        platform: platform,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    return new Response(JSON.stringify({
      message: 'Submission received successfully',
      data: submission
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('not eligible') ? 403 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 