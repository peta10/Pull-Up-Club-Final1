-- Add additional fields to the submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS club_affiliation text,
ADD COLUMN IF NOT EXISTS age integer;

-- Add a trigger to enforce the 30-day cooldown period
CREATE OR REPLACE FUNCTION public.enforce_submission_cooldown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_eligible boolean;
  has_rejected boolean;
BEGIN
  -- Check if the user has a rejected submission
  SELECT EXISTS (
    SELECT 1 FROM public.submissions
    WHERE user_id = NEW.user_id AND status = 'rejected'
  ) INTO has_rejected;
  
  -- If they have a rejected submission, allow them to submit
  IF has_rejected THEN
    RETURN NEW;
  END IF;
  
  -- Otherwise, check eligibility
  SELECT public.check_submission_eligibility(NEW.user_id) INTO is_eligible;
  
  IF NOT is_eligible THEN
    RAISE EXCEPTION 'You must wait 30 days between submissions';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS check_submission_cooldown ON public.submissions;
CREATE TRIGGER check_submission_cooldown
  BEFORE INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_submission_cooldown(); 