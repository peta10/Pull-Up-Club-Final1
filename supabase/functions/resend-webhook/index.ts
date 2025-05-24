import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const RESEND_WEBHOOK_SECRET = Deno.env.get('RESEND_WEBHOOK_SECRET') ?? '';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  try {
    // Verify Resend webhook signature
    const signature = req.headers.get('resend-signature');
    if (!signature || signature !== RESEND_WEBHOOK_SECRET) {
      throw new Error('Invalid webhook signature');
    }

    const payload = await req.json();
    const { type, data } = payload;

    // Log webhook event
    const { error: logError } = await supabaseAdmin
      .from('email_events')
      .insert({
        type,
        email: data.to,
        event_data: data,
        created_at: new Date().toISOString()
      });

    if (logError) {
      throw logError;
    }

    // Update notification queue status based on event
    switch (type) {
      case 'email.sent':
        await supabaseAdmin
          .from('notification_queue')
          .update({ 
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('data->to', data.to)
          .is('sent_at', null);
        break;

      case 'email.delivered':
        await supabaseAdmin
          .from('notification_queue')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('data->to', data.to)
          .eq('status', 'sent');
        break;

      case 'email.delivery_delayed':
        await supabaseAdmin
          .from('notification_queue')
          .update({ 
            status: 'delayed',
            error: 'Delivery delayed: ' + (data.reason || 'Unknown reason'),
            updated_at: new Date().toISOString()
          })
          .eq('data->to', data.to)
          .eq('status', 'sent');
        break;

      case 'email.bounced':
      case 'email.complained':
        await supabaseAdmin
          .from('notification_queue')
          .update({ 
            status: type === 'email.bounced' ? 'bounced' : 'complained',
            error: data.reason || data.description,
            updated_at: new Date().toISOString()
          })
          .eq('data->to', data.to)
          .eq('status', 'sent');

        // Add to suppression list if permanent bounce or complaint
        if (type === 'email.bounced' && data.bounce_type === 'permanent' || type === 'email.complained') {
          await supabaseAdmin
            .from('email_suppression')
            .upsert({
              email: data.to,
              reason: type === 'email.bounced' ? 'bounce' : 'complaint',
              details: data.reason || data.description,
              created_at: new Date().toISOString()
            }, {
              onConflict: 'email'
            });
        }
        break;

      case 'email.opened':
      case 'email.clicked':
        // Track engagement
        await supabaseAdmin
          .from('email_engagement')
          .insert({
            email: data.to,
            type: type.replace('email.', ''),
            metadata: data,
            created_at: new Date().toISOString()
          });
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}); 