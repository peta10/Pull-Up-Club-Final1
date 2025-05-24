import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user's session from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user's session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      console.error('User verification error:', userError)
      throw new Error('Invalid session')
    }

    console.log('User verified:', user.email)

    // Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabaseClient
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminError) {
      console.error('Admin check error:', adminError)
      throw new Error('Error checking admin status')
    }

    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    console.log('Admin status verified')

    // Fetch all users with their profile information
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, role, is_paid, created_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Users fetch error:', usersError)
      throw usersError
    }

    console.log('Users fetched successfully:', users?.length ?? 0)

    return new Response(
      JSON.stringify({ users }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400,
      }
    )
  }
}) 