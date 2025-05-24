-- Create the check_submission_eligibility function
CREATE OR REPLACE FUNCTION public.check_submission_eligibility(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_approval_date TIMESTAMPTZ;
  cooldown_days INTEGER := 30; -- Configurable cooldown period
BEGIN
  -- Get the date of the user's last approved submission
  SELECT MAX(approved_at) INTO last_approval_date
  FROM public.submissions
  WHERE user_id = $1 AND status = 'approved';
  
  -- If no approved submissions or last approval was more than cooldown_days ago, user is eligible
  RETURN (last_approval_date IS NULL OR (CURRENT_TIMESTAMP - last_approval_date) > (cooldown_days * INTERVAL '1 day'));
END;
$$;

-- Create the user_can_submit function
CREATE OR REPLACE FUNCTION public.user_can_submit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return false if user is not authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user is eligible to submit
  RETURN public.check_submission_eligibility(auth.uid());
END;
$$; 