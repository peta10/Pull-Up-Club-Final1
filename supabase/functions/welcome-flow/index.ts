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
  // This function can be triggered by a webhook when a subscription becomes active
  // For CRON jobs, we'd implement a different pattern
  
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message || 'User profile not found');
    }

    // Prepare welcome messages
    const emailSubject = 'Welcome to Pull-Up Club!';
    const emailMessage = `\
Hello ${profile.full_name || 'there'},\
\
Welcome to Pull-Up Club! We\'re thrilled to have you join our community.\
\
Your journey to becoming stronger starts now. Here\'s what you can expect:\
- Regular workout challenges\
- Access to our leaderboard\
- Achievement badges for milestones\
- A supportive community\
\
Stay tuned for your first workout summon!\
\
Pull up strong,\
The Pull-Up Club Team\
`;

    const smsMessage = `Welcome to Pull-Up Club! Your membership is now active. Get ready for your first workout summon soon!`;

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

    // Log communication in the database
    if (emailResult.success || smsResult.success) {
      await supabaseAdmin.from('messages_log').insert({
        user_id: userId,
        message_type: 'welcome',
        content: emailMessage,
        delivery_status: 'sent',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent: emailResult.success,
        smsSent: smsResult.success,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in welcome flow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 