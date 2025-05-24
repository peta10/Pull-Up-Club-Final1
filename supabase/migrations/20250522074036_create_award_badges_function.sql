-- Create the award_badges_on_approval function
CREATE OR REPLACE FUNCTION public.award_badges_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_gender TEXT;
  badge_record RECORD;
BEGIN
  -- Only proceed if status was changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN
    -- Get the user's gender
    SELECT gender INTO user_gender FROM public.profiles WHERE id = NEW.user_id;
    
    -- Award badges based on pull-up count and gender
    FOR badge_record IN 
      SELECT * FROM public.badges 
      WHERE (gender = user_gender OR gender = 'Any')
        AND min_pull_ups <= NEW.actual_pull_up_count
    LOOP
      -- Insert badge if not already awarded
      INSERT INTO public.user_badges (user_id, badge_id, submission_id)
      VALUES (NEW.user_id, badge_record.id, NEW.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_submission_approved
  AFTER UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.award_badges_on_approval(); 