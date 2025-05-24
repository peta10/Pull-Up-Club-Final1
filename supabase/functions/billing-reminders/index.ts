import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// SMS/Email service implementation would go here
// For now, we'll mock it and log the messages
class NotificationService {
  async sendSMS(phoneNumber: string, message: string) {
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return { success: true, id: crypto.randomUUID() };
  }

  async sendEmail(email: string, subject: string, message: string) {
    console.log(`Email to ${email}:\\nSubject: ${subject}\\nBody: ${message}`);
    return { success: true, id: crypto.randomUUID() };
  }
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const notificationService = new NotificationService();

serve(async (req) => {
  // When running as a scheduled function, this would be triggered by a CRON expression
  // This function looks for subscriptions that are about to renew
  
  try {
    const currentTime = new Date();
    // By default, send reminders 3 days before renewal
    const reminderDays = 3;
    // As this is a CRON job, set a reasonable batch size to avoid timeouts
    const batchSize = 50;
    let processed = 0;
    let successful = 0;

    // Calculate the date range for reminders
    // We're looking for subscriptions that renew between 3 days from now and 3 days + 1 hour from now
    // This gives us a 1-hour window for the daily CRON job
    const reminderStart = new Date(currentTime.getTime() + (reminderDays * 24 * 60 * 60 * 1000));
    const reminderEnd = new Date(reminderStart.getTime() + (1 * 60 * 60 * 1000));

    // Query for subscriptions that are due for renewal reminder
    const { data: dueSubscriptions, error: queryError } = await supabaseAdmin
      .from('subscriptions')
      .select(`\
        id,\
        user_id,\
        status,\
        current_period_end,\
        profiles!subscriptions_user_id_fkey(full_name, email, phone)\
      `)
      .eq('status', 'active')
      .gte('current_period_end', reminderStart.toISOString())
      .lt('current_period_end', reminderEnd.toISOString())
      .limit(batchSize);

    if (queryError) {
      throw new Error(`Error querying due subscriptions: ${queryError.message}`);
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions due for reminder' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Format the renewal date in a friendly way
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { \
        weekday: 'long', \
        year: 'numeric', \
        month: 'long', \
        day: 'numeric' \
      });
    };

    // For each subscription, send a reminder
    for (const subscription of dueSubscriptions) {
      processed++;
      try {
        const profile = subscription.profiles;
        if (!profile) continue;

        const renewalDate = formatDate(subscription.current_period_end);
        const manageBillingUrl = `${Deno.env.get('APP_URL') || 'https://pullupclub.com'}/account/billing`;

        // Prepare messages
        const emailSubject = `Your Pull-Up Club subscription renews soon`;
        const emailMessage = `
Hey ${profile.full_name || 'there'},

Just a friendly reminder that your Pull-Up Club subscription will renew on ${renewalDate}.

You'll be charged our regular price of $9.99 for another month of Pull-Up Club membership.

If you need to update your payment method or cancel, please visit: ${manageBillingUrl}

Thank you for being part of Pull-Up Club!

Pull up strong,
The Pull-Up Club Team
`;

        const smsMessage = `PULL-UP CLUB: Your subscription renews on ${renewalDate} for $9.99. Manage your subscription here: ${manageBillingUrl}`;

        // Send notifications
        let emailResult = { success: false };
        let smsResult = { success: false };
        
        if (profile.email) {
          emailResult = await notificationService.sendEmail(
            profile.email,
            emailSubject,
            emailMessage
          );
        }
        
        if (profile.phone) {
          smsResult = await notificationService.sendSMS(
            profile.phone,
            smsMessage
          );
        }

        // Log communication
        if (emailResult.success || smsResult.success) {
          await supabaseAdmin.from('messages_log').insert({
            user_id: subscription.user_id,
            message_type: 'billing_reminder',
            content: JSON.stringify({
              renewalDate: subscription.current_period_end,
              amount: 9.99,
              currency: 'USD',
            }),
            delivery_status: 'sent',
          });

          successful++;
        }
      } catch (userError) {
        console.error(`Error processing subscription ${subscription.id}:`, userError);
        // Continue with the next subscription
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        successful,
        timestamp: currentTime.toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in billing reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 