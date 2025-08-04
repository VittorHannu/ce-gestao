-- Drop existing SELECT policies on profiles if they restrict admin access
-- This is a generic drop, you might need to adjust if your policy has a specific name
DROP POLICY IF EXISTS "Allow individual access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view own profile" ON public.profiles;

-- Policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE));

-- Policy to allow users to view their own profile (if not admin)
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());
