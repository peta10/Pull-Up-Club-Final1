-- Create submissions table
CREATE TABLE public.submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    video_url text NOT NULL,
    pull_up_count integer NOT NULL,
    actual_pull_up_count integer,
    status text DEFAULT 'pending',
    notes text,
    submitted_at timestamptz DEFAULT now(),
    approved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own submissions"
    ON public.submissions
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
    ON public.submissions
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their rejected submissions"
    ON public.submissions
    FOR UPDATE
    TO public
    USING (auth.uid() = user_id AND status = 'rejected'); 