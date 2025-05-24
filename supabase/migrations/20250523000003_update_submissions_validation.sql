-- Update the insert policy for submissions to include validation
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.submissions;

CREATE POLICY "Users can insert their own submissions with validation"
    ON public.submissions
    FOR INSERT
    TO public
    WITH CHECK (
        auth.uid() = user_id AND
        (
            -- Users can submit if they have a rejected submission or meet the cooldown criteria
            EXISTS (
                SELECT 1 FROM public.submissions
                WHERE user_id = auth.uid() AND status = 'rejected'
            ) OR
            public.check_submission_eligibility(auth.uid())
        )
    );

-- Create a function to check for pending submissions
CREATE OR REPLACE FUNCTION public.has_pending_submission(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.submissions
    WHERE user_id = $1 AND status = 'pending'
  );
END;
$$;

-- Create a better error message function for the frontend
CREATE OR REPLACE FUNCTION public.get_submission_status(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  last_approved timestamptz;
  days_left integer;
BEGIN
  -- Check if there's a pending submission
  IF public.has_pending_submission(user_id) THEN
    result = jsonb_build_object(
      'can_submit', false,
      'message', 'You already have a pending submission under review.',
      'status', 'pending'
    );
    RETURN result;
  END IF;
  
  -- Check if there's a rejected submission
  IF EXISTS (SELECT 1 FROM public.submissions WHERE user_id = $1 AND status = 'rejected') THEN
    result = jsonb_build_object(
      'can_submit', true,
      'message', 'Your previous submission was rejected. You can submit a new video.',
      'status', 'rejected'
    );
    RETURN result;
  END IF;
  
  -- Check cooldown period
  SELECT MAX(approved_at) INTO last_approved
  FROM public.submissions
  WHERE user_id = $1 AND status = 'approved';
  
  IF last_approved IS NULL THEN
    result = jsonb_build_object(
      'can_submit', true,
      'message', 'You can submit your first video.',
      'status', 'eligible'
    );
    RETURN result;
  END IF;
  
  days_left = 30 - EXTRACT(DAY FROM (CURRENT_TIMESTAMP - last_approved));
  
  IF days_left <= 0 THEN
    result = jsonb_build_object(
      'can_submit', true,
      'message', 'You can submit your next video.',
      'status', 'eligible'
    );
  ELSE
    result = jsonb_build_object(
      'can_submit', false,
      'message', 'You must wait ' || days_left || ' more days before your next submission.',
      'status', 'cooldown',
      'days_left', days_left,
      'next_eligible_date', last_approved + INTERVAL '30 days'
    );
  END IF;
  
  RETURN result;
END;
$$; 