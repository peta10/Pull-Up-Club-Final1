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

// Workout challenges that can be randomly selected
const workoutChallenges = [
  {
    name: 'Max Reps Challenge',
    description: 'Do as many pull-ups as you can in a single set. Push your limits!',
    videoUrl: 'https://pullupclub.com/demos/max-reps.mp4',
  },
  {
    name: 'Endurance Test',
    description: 'Do 5 pull-ups every minute for 10 minutes. Test your recovery!',
    videoUrl: 'https://pullupclub.com/demos/endurance.mp4',
  },
  {
    name: 'Perfect Form',
    description: 'Do 10 pull-ups with perfect form, focusing on full range of motion.',
    videoUrl: 'https://pullupclub.com/demos/perfect-form.mp4',
  },
  {
    name: 'Weighted Challenge',
    description: 'Add some weight and do 5 pull-ups. Show us what you can do!',
    videoUrl: 'https://pullupclub.com/demos/weighted.mp4',
  },
  {
    name: 'Tempo Training',
    description: '5 pull-ups with 3 seconds up, 1 second hold, 3 seconds down.',
    videoUrl: 'https://pullupclub.com/demos/tempo.mp4',
  }
];

// For better randomness, we'd implement a more sophisticated algorithm
// that ensures users don't get the same challenge repeatedly
function getRandomWorkout() {
  const randomIndex = Math.floor(Math.random() * workoutChallenges.length);
  return workoutChallenges[randomIndex];
}

serve(async (req) => {
  // When running as a scheduled function, expect the CRON pattern here
  // For manual triggers, we can allow specifying batch size, etc.
  
  try {
    const currentTime = new Date();
    // As this is a CRON job, set a reasonable batch size to avoid timeouts
    const batchSize = 50;
    let processed = 0;
    let successful = 0;

    // Query for active subscribers who haven't been summoned recently
    // This uses the subscription status directly or the is_paid flag as a fallback
    const { data: eligibleUsers, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select(`\
        id,\
        full_name,\
        email,\
        phone,\
        last_summon_at,\
        gender\
      `)
      .eq('is_paid', true)
      .or(
        `last_summon_at.is.null,
        last_summon_at.lt.${new Date(currentTime.getTime() - 24 * 60 * 60 * 1000).toISOString()}`
      )
      .limit(batchSize);

    if (queryError) {
      throw new Error(`Error querying eligible users: ${queryError.message}`);
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No eligible users found for summon' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // For each eligible user, send a workout summon
    const workout = getRandomWorkout();
    const submissionUrl = `${Deno.env.get('APP_URL') || 'https://pullupclub.com'}/submit`;
    
    for (const user of eligibleUsers) {
      processed++;
      try {
        // Prepare messages
        const emailSubject = `🔥 Your Pull-Up Club Challenge Awaits!`;
        const emailMessage = `\
Hey ${user.full_name || 'there'},\
\
It\'s time for your Pull-Up Club challenge!\
\
${workout.name}: ${workout.description}\
\
Watch the demo: ${workout.videoUrl}\
\
When you\'re ready, record your attempt and submit it here: ${submissionUrl}\
\
Pull up strong,\
The Pull-Up Club Team\
`;

        const smsMessage = `PULL-UP CLUB: Your challenge: ${workout.name} - ${workout.description}. Submit your video here: ${submissionUrl}`;

        // Send notifications
        let emailResult = { success: false };
        let smsResult = { success: false };
        
        if (user.email) {
          emailResult = await notificationService.sendEmail(
            user.email,
            emailSubject,
            emailMessage
          );
        }
        
        if (user.phone) {
          smsResult = await notificationService.sendSMS(
            user.phone,
            smsMessage
          );
        }

        // Log communication and update last_summon_at
        if (emailResult.success || smsResult.success) {
          await supabaseAdmin.from('messages_log').insert({
            user_id: user.id,
            message_type: 'summon',
            content: JSON.stringify({
              workout: workout.name,
              description: workout.description,
              videoUrl: workout.videoUrl,
            }),
            delivery_status: 'sent',
          });

          // Update the user's last_summon_at timestamp
          await supabaseAdmin
            .from('profiles')
            .update({ last_summon_at: currentTime.toISOString() })
            .eq('id', user.id);

          successful++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        // Continue with the next user
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
    console.error('Error in summon flow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 