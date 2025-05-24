-- Create email events table
CREATE TABLE public.email_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL,
    email text NOT NULL,
    event_data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Create email engagement table
CREATE TABLE public.email_engagement (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    type text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Add delivered_at column to notification_queue
ALTER TABLE public.notification_queue 
ADD COLUMN delivered_at timestamptz;

-- Create indexes
CREATE INDEX idx_email_events_type ON public.email_events (type);
CREATE INDEX idx_email_events_email ON public.email_events (email);
CREATE INDEX idx_email_events_created ON public.email_events (created_at);

CREATE INDEX idx_email_engagement_type ON public.email_engagement (type);
CREATE INDEX idx_email_engagement_email ON public.email_engagement (email);
CREATE INDEX idx_email_engagement_created ON public.email_engagement (created_at);

-- Enable RLS
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email events"
    ON public.email_events
    FOR SELECT
    TO public
    USING (email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view their own email engagement"
    ON public.email_engagement
    FOR SELECT
    TO public
    USING (email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ));

CREATE POLICY "Admin can view all email events"
    ON public.email_events
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin can view all email engagement"
    ON public.email_engagement
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 