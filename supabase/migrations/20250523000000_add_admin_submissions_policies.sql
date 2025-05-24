-- Add admin policies for the submissions table
CREATE POLICY "Admin users can view all submissions"
    ON public.submissions
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admin users can update all submissions"
    ON public.submissions
    FOR UPDATE
    TO public
    USING (EXISTS (
        SELECT 1 FROM admin_roles
        WHERE user_id = auth.uid()
    )); 