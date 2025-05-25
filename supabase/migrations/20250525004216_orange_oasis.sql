-- Add pending subscription plan field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pending_subscription_plan jsonb;

-- Create function to handle pending subscription
CREATE OR REPLACE FUNCTION handle_pending_subscription(user_id UUID, plan_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET pending_subscription_plan = plan_data
  WHERE id = user_id;
END;
$$;

-- Create function to clear pending subscription
CREATE OR REPLACE FUNCTION clear_pending_subscription(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET pending_subscription_plan = NULL
  WHERE id = user_id;
END;
$$;

-- Create function to update profile settings
CREATE OR REPLACE FUNCTION update_profile_settings(
  setting_type TEXT,
  new_values JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  current_settings JSONB;
  updated_settings JSONB;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Check if user exists
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current settings
  EXECUTE format('
    SELECT %I 
    FROM profiles 
    WHERE id = $1
  ', setting_type)
  INTO current_settings
  USING user_id;
  
  -- Set default if null
  IF current_settings IS NULL THEN
    current_settings := '{}'::JSONB;
  END IF;
  
  -- Merge new values with existing settings
  updated_settings := current_settings || new_values;
  
  -- Update the settings
  EXECUTE format('
    UPDATE profiles 
    SET %I = $1, 
        updated_at = now() 
    WHERE id = $2
    RETURNING %I
  ', setting_type, setting_type)
  INTO updated_settings
  USING updated_settings, user_id;
  
  RETURN updated_settings;
END;
$$;