-- Create badges table
CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    image_url text,
    min_pull_ups integer,
    gender text,
    requirements text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    badge_id uuid NOT NULL REFERENCES public.badges(id),
    submission_id uuid REFERENCES public.submissions(id),
    awarded_at timestamptz DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for badges
CREATE POLICY "Everyone can view badges"
    ON public.badges
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Only admins can modify badges"
    ON public.badges
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges"
    ON public.user_badges
    FOR SELECT
    TO public
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view all user badges"
    ON public.user_badges
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Only admins can modify user badges"
    ON public.user_badges
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )); 