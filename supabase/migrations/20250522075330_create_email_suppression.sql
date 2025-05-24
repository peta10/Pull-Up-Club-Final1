-- Create email suppression list table
CREATE TABLE public.email_suppression (
    email text PRIMARY KEY,
    reason text NOT NULL,
    details text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX idx_email_suppression_reason ON public.email_suppression (reason);

-- Enable RLS
ALTER TABLE public.email_suppression ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own suppression status"
    ON public.email_suppression
    FOR SELECT
    TO public
    USING (email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ));

CREATE POLICY "Admin can manage suppression list"
    ON public.email_suppression
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    )); 