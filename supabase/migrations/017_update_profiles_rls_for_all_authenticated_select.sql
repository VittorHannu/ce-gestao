-- Drop the previous SELECT policy on profiles
DROP POLICY IF EXISTS "Allow users to view own profile or admins to view all (via function)" ON public.profiles;

-- Create a new SELECT policy to allow all authenticated users to view all profiles
CREATE POLICY "Allow authenticated users to view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
