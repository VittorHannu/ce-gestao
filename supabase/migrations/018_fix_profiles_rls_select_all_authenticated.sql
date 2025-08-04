-- Drop the previous SELECT policy on profiles
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON public.profiles;

-- Create a new SELECT policy to allow all authenticated users to view all profiles
-- This policy is simpler and more direct, ensuring all authenticated users can see all profiles.
CREATE POLICY "Allow all authenticated users to view all profiles (fixed)" ON public.profiles
  FOR SELECT USING (TRUE);
