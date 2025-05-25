-- Add insert RLS policy for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow the auth trigger (user themselves) to insert their own profile row on sign-up
CREATE POLICY "Allow users to insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id); 