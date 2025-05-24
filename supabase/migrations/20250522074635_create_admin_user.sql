-- Create admin_roles table
CREATE TABLE public.admin_roles (
    user_id uuid NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles WHERE user_id = auth.uid()
  );
END;
$$;

-- Create policies
CREATE POLICY "Users can view their own admin status"
    ON public.admin_roles
    FOR SELECT
    TO public
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage admin roles"
    ON public.admin_roles
    FOR ALL
    TO public
    USING (is_admin()); 