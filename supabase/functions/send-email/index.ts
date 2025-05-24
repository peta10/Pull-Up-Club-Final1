import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const smtp = new SMTPClient({
  connection: {
    hostname: Deno.env.get('SMTP_HOSTNAME') ?? '',
    port: parseInt(Deno.env.get('SMTP_PORT') ?? '587'),
    tls: true,
    auth: {
      username: Deno.env.get('SMTP_USERNAME') ?? '',
      password: Deno.env.get('SMTP_PASSWORD') ?? '',
    },
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processTemplateVariables(template: string, data: Record<string, any>): Promise<string> {
  let processed = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value?.toString() ?? '');
  }
  return processed;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Process pending notifications
    const { data: pendingNotifications, error: queryError } = await supabaseAdmin
      .from('notification_queue')
      .select(`
        id,
        user_id,
        data,
        notification_templates (
          subject,
          body_template
        ),
        profiles (
          email,
          full_name
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10);

    if (queryError) throw queryError;

    const results = [];
    for (const notification of pendingNotifications ?? []) {
      try {
        // Process template
        const subject = await processTemplateVariables(
          notification.notification_templates.subject,
          { ...notification.data, full_name: notification.profiles.full_name }
        );

        const body = await processTemplateVariables(
          notification.notification_templates.body_template,
          { ...notification.data, full_name: notification.profiles.full_name }
        );

        // Send email
        await smtp.send({
          from: Deno.env.get('SMTP_FROM_EMAIL') ?? 'noreply@pullupclub.com',
          to: notification.profiles.email,
          subject,
          content: body,
        });

        // Update notification status
        const { error: updateError } = await supabaseAdmin
          .from('notification_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        if (updateError) throw updateError;

        results.push({
          id: notification.id,
          status: 'sent',
          email: notification.profiles.email
        });
      } catch (error) {
        // Log error and update notification
        const { error: updateError } = await supabaseAdmin
          .from('notification_queue')
          .update({
            status: 'error',
            error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 