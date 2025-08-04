-- Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE);
END;
$$;

-- Grant execute on is_admin() to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Drop the previous SELECT policy on profiles
DROP POLICY IF EXISTS "Allow users to view own profile or admins to view all" ON public.profiles;

-- Create a new, combined SELECT policy using is_admin() function
CREATE POLICY "Allow users to view own profile or admins to view all (via function)" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() -- User can view their own profile
    OR
    public.is_admin() -- Or if the authenticated user is an admin (checked via function)
  );
