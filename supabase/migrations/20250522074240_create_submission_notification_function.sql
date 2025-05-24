-- Create the notify_on_submission_review function
CREATE OR REPLACE FUNCTION public.notify_on_submission_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if status was changed
  IF NEW.status <> OLD.status AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    -- Log a message based on the new status
    IF NEW.status = 'approved' THEN
      INSERT INTO public.messages_log (user_id, message_type, content)
      VALUES (
        NEW.user_id, 
        'submission_approved', 
        'Congratulations! Your submission has been approved with ' || NEW.actual_pull_up_count || ' pull-ups. Check the leaderboard to see your ranking!'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.messages_log (user_id, message_type, content)
      VALUES (
        NEW.user_id, 
        'submission_rejected', 
        'Your submission has been rejected. Reason: ' || COALESCE(NEW.notes, 'No reason provided') || '. You can resubmit at any time.'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_submission_review
  AFTER UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_submission_review(); 