-- Drop existing UPDATE policies on profiles if they restrict access
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to update profiles" ON public.profiles;

-- Create a new, combined UPDATE policy
CREATE POLICY "Allow users to update own profile or admins to update all" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() -- User can update their own profile
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE) -- Or if the authenticated user is an admin
  );
