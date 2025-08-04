-- Drop the previous SELECT policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a single, combined SELECT policy
CREATE POLICY "Allow users to view own profile or admins to view all" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() -- User can view their own profile
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE) -- Or if the authenticated user is an admin
  );
