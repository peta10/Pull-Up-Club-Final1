-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    age integer,
    organisation text,
    gender text,
    phone text,
    address text,
    stripe_customer_id text,
    is_paid boolean DEFAULT false,
    role text DEFAULT 'user',
    last_summon_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO public
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO public
    USING (auth.uid() = id); 