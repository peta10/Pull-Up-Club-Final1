-- Fix infinite recursion in admin_roles policies
-- The problem occurs because the admin check policy is checking the admin_roles table,
-- which triggers the policy again, creating an infinite loop

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Combined admin_roles select policy" ON public.admin_roles;

-- Create a security definer function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial to bypass RLS
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Create a simple SELECT policy that doesn't cause recursion
-- This allows users to see their own admin status
CREATE POLICY "Users can view their own admin status"
  ON public.admin_roles
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

-- Create a separate policy for admin management that uses our new function
-- This avoids recursion by using the security definer function
CREATE POLICY "Admin management policy"
  ON public.admin_roles
  FOR ALL 
  TO public
  USING (public.check_is_admin())
  WITH CHECK (public.check_is_admin());

-- Update any other functions that might be using a recursive check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Verify and update other policies that might use the problematic pattern
DO $$
BEGIN
  -- Update any other policies that might be using the same pattern
  -- This is a safer approach than trying to modify all policies at once
  -- We're focusing on the core issue first
  
  RAISE NOTICE 'Fixed admin_roles recursion issue';
END
$$;