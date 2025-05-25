-- Create RPC functions for admin dashboards

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_users integer;
  paid_users integer;
  active_users integer;
  recent_signups integer;
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can access this function';
  END IF;

  -- Get total users
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Get paid users
  SELECT COUNT(*) INTO paid_users FROM public.profiles WHERE is_paid = true;
  
  -- Get active users (signed in within 30 days)
  SELECT COUNT(DISTINCT user_id) INTO active_users 
  FROM auth.sessions 
  WHERE created_at > (now() - interval '30 days');
  
  -- Get recent signups (last 7 days)
  SELECT COUNT(*) INTO recent_signups 
  FROM public.profiles 
  WHERE created_at > (now() - interval '7 days');
  
  RETURN json_build_object(
    'total_users', total_users,
    'paid_users', paid_users,
    'active_users', active_users,
    'recent_signups', recent_signups
  );
END;
$$;

-- Function to get submission statistics
CREATE OR REPLACE FUNCTION public.get_submission_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_count integer;
  approved_count integer;
  rejected_count integer;
  total_count integer;
  avg_approval_time interval;
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can access this function';
  END IF;

  -- Get submissions by status
  SELECT COUNT(*) INTO pending_count 
  FROM public.submissions 
  WHERE status = 'pending';
  
  SELECT COUNT(*) INTO approved_count 
  FROM public.submissions 
  WHERE status = 'approved';
  
  SELECT COUNT(*) INTO rejected_count 
  FROM public.submissions 
  WHERE status = 'rejected';
  
  SELECT COUNT(*) INTO total_count 
  FROM public.submissions;
  
  -- Get average time to approve submissions
  SELECT AVG(approved_at - created_at) INTO avg_approval_time
  FROM public.submissions 
  WHERE status = 'approved' AND approved_at IS NOT NULL;
  
  RETURN json_build_object(
    'pending', pending_count,
    'approved', approved_count,
    'rejected', rejected_count,
    'total', total_count,
    'avg_approval_time', avg_approval_time
  );
END;
$$;

-- Function to get badge statistics
CREATE OR REPLACE FUNCTION public.get_badge_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_badges integer;
  badges_awarded integer;
  most_awarded record;
  least_awarded record;
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can access this function';
  END IF;

  -- Get total badges
  SELECT COUNT(*) INTO total_badges FROM public.badges;
  
  -- Get total awarded badges
  SELECT COUNT(*) INTO badges_awarded FROM public.user_badges;
  
  -- Get most awarded badge
  SELECT b.id, b.name, COUNT(ub.id) as award_count 
  INTO most_awarded
  FROM public.badges b
  JOIN public.user_badges ub ON b.id = ub.badge_id
  GROUP BY b.id, b.name
  ORDER BY award_count DESC
  LIMIT 1;
  
  -- Get least awarded badge
  SELECT b.id, b.name, COUNT(ub.id) as award_count 
  INTO least_awarded
  FROM public.badges b
  LEFT JOIN public.user_badges ub ON b.id = ub.badge_id
  GROUP BY b.id, b.name
  ORDER BY award_count ASC
  LIMIT 1;
  
  RETURN json_build_object(
    'total_badges', total_badges,
    'badges_awarded', badges_awarded,
    'most_awarded', json_build_object(
      'id', most_awarded.id,
      'name', most_awarded.name,
      'count', most_awarded.award_count
    ),
    'least_awarded', json_build_object(
      'id', least_awarded.id,
      'name', least_awarded.name,
      'count', least_awarded.award_count
    )
  );
END;
$$;