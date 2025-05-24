-- First, drop the existing function
DROP FUNCTION IF EXISTS public.get_submissions_with_users();

-- Now create the function with admin check and proper return type
CREATE OR REPLACE FUNCTION public.get_submissions_with_users()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can access this function';
  END IF;

  -- Return submissions with user data
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', s.id,
      'user_id', s.user_id,
      'video_url', s.video_url,
      'pull_up_count', s.pull_up_count,
      'actual_pull_up_count', s.actual_pull_up_count,
      'status', s.status,
      'notes', s.notes,
      'submitted_at', s.submitted_at,
      'approved_at', s.approved_at,
      'created_at', s.created_at,
      'updated_at', s.updated_at,
      'platform', s.platform,
      'email', p.email,
      'full_name', p.full_name,
      'age', p.age,
      'gender', p.gender,
      'region', p.city, -- Using city instead of region
      'club_affiliation', p.organisation
    )
  FROM 
    public.submissions s
  LEFT JOIN 
    public.profiles p ON s.user_id = p.id
  ORDER BY 
    s.created_at DESC;
END;
$$;

-- Add RLS policy to ensure only admins can use this function
REVOKE EXECUTE ON FUNCTION public.get_submissions_with_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_submissions_with_users() TO authenticated;

-- Create a security policy that only allows admins to execute this function
CREATE OR REPLACE FUNCTION public.is_admin_for_function()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid()
    )
  );
END;
$$;

-- Create the policy to validate admin role before execution
ALTER FUNCTION public.get_submissions_with_users()
SET row_security = ON;

COMMENT ON FUNCTION public.get_submissions_with_users() IS 'Gets all submissions with associated user information - for admin use only'; 