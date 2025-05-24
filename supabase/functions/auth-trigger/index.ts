import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    email: string;
    [key: string]: any;
  };
  schema: string;
  old_record: any | null;
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  // Only run this function for INSERT events on auth.users
  if (payload.type !== 'INSERT' || payload.table !== 'users' || payload.schema !== 'auth') {
    return new Response(JSON.stringify({ message: 'Not a relevant event' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check if user already has a profile (should be extremely rare due to the trigger design)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', payload.record.id)
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ message: 'Profile already exists' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a new profile for this user
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: payload.record.id,
        email: payload.record.email,
        role: 'user', // Default role
        is_paid: false, // Default payment status
      });

    if (error) throw error;

    console.log(`Profile created for user: ${payload.record.id}`);

    return new Response(JSON.stringify({ message: 'Profile created successfully', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 