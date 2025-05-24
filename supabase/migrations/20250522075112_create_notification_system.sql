-- Create notification_templates table
CREATE TABLE public.notification_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    subject text NOT NULL,
    body_template text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create notification_queue table
CREATE TABLE public.notification_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    template_id uuid REFERENCES public.notification_templates(id),
    status text DEFAULT 'pending',
    data jsonb DEFAULT '{}',
    scheduled_for timestamptz DEFAULT now(),
    sent_at timestamptz,
    error text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notification_queue_status ON public.notification_queue (status, scheduled_for);
CREATE INDEX idx_notification_queue_user ON public.notification_queue (user_id);

-- Insert default templates
INSERT INTO public.notification_templates (type, subject, body_template) VALUES
-- Welcome Email
('welcome', 'Welcome to Pull-Up Club! 💪', 
'Hi {{full_name}},

Welcome to Pull-Up Club! We''re excited to have you join our community of fitness enthusiasts.

Here''s what you can do now:
1. Complete your profile
2. Check out the leaderboard
3. Submit your first pull-up video

Let''s get started!

Best,
The Pull-Up Club Team'),

-- Submission Rejected
('submission_rejected', 'Pull-Up Submission Update', 
'Hi {{full_name}},

Your recent pull-up submission has been reviewed. Unfortunately, it wasn''t approved for the following reason:

{{rejection_reason}}

You can submit a new video right away. Here are the submission guidelines:
{{submission_guidelines}}

Keep pushing!

Best,
The Pull-Up Club Team'),

-- Submission Approved
('submission_approved', 'Congratulations! Pull-Up Submission Approved 🎉', 
'Hi {{full_name}},

Great news! Your pull-up submission has been approved with {{actual_pull_up_count}} pull-ups!

Current Stats:
- Rank: {{overall_rank}}
- Personal Best: {{best_pull_up_count}}
{{badge_info}}

Your next submission will be available in 30 days.

Keep up the great work!

Best,
The Pull-Up Club Team'),

-- Badge Achievement
('badge_earned', 'New Badge Earned! 🏆', 
'Hi {{full_name}},

Congratulations! You''ve earned a new badge:

🏅 {{badge_name}}
{{badge_description}}

Check out your profile to see all your badges!

Keep crushing it!

Best,
The Pull-Up Club Team'),

-- Rank Change
('rank_change', 'Leaderboard Update 📈', 
'Hi {{full_name}},

Your position on the leaderboard has changed!

Previous Rank: {{old_rank}}
New Rank: {{new_rank}}
{{rank_change_message}}

Keep pushing to climb higher!

Best,
The Pull-Up Club Team');

-- Create function to queue notification
CREATE OR REPLACE FUNCTION public.queue_notification(
    p_user_id uuid,
    p_template_type text,
    p_data jsonb DEFAULT '{}'::jsonb,
    p_scheduled_for timestamptz DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_template_id uuid;
    v_notification_id uuid;
BEGIN
    -- Get template ID
    SELECT id INTO v_template_id
    FROM public.notification_templates
    WHERE type = p_template_type;

    IF v_template_id IS NULL THEN
        RAISE EXCEPTION 'Template type % not found', p_template_type;
    END IF;

    -- Insert into queue
    INSERT INTO public.notification_queue
        (user_id, template_id, data, scheduled_for)
    VALUES
        (p_user_id, v_template_id, p_data, p_scheduled_for)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$;

-- Create function to process notifications
CREATE OR REPLACE FUNCTION public.process_notification(
    notification_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification record;
    v_template record;
    v_user record;
    v_processed_body text;
BEGIN
    -- Get notification details
    SELECT nq.*, nt.subject, nt.body_template, p.full_name, p.email
    INTO v_notification
    FROM public.notification_queue nq
    JOIN public.notification_templates nt ON nq.template_id = nt.id
    JOIN public.profiles p ON nq.user_id = p.id
    WHERE nq.id = notification_id
    AND nq.status = 'pending'
    FOR UPDATE;

    IF v_notification IS NULL THEN
        RETURN 'Notification not found or not pending';
    END IF;

    -- Process template with data
    v_processed_body := v_notification.body_template;
    
    -- Replace variables in template
    v_processed_body := regexp_replace(
        v_processed_body,
        '{{full_name}}',
        COALESCE(v_notification.full_name, 'User'),
        'g'
    );
    
    -- Update notification as processed
    UPDATE public.notification_queue
    SET 
        status = 'processed',
        updated_at = now()
    WHERE id = notification_id;

    -- Return processed template
    RETURN v_processed_body;
END;
$$;

-- Create RLS policies
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY "Admin can manage notification templates"
    ON public.notification_templates
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notification_queue
    FOR SELECT
    TO public
    USING (user_id = auth.uid());

-- Admin can manage all notifications
CREATE POLICY "Admin can manage all notifications"
    ON public.notification_queue
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 