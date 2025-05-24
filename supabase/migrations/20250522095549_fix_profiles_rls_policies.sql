-- Drop old admin policies that used role column
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;

-- Create new admin policies using admin_roles table
CREATE POLICY "Admin users can view all profiles"
    ON public.profiles
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin users can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO public
    USING (EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
    )); 