-- Drop the existing policy that relies on the has_permission function
DROP POLICY IF EXISTS "Allow admin read access" ON public.user_activity_logs;

-- Create a new policy that directly checks the profiles table for the can_view_users permission
CREATE POLICY "Allow admin read access based on profiles table"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND can_view_users = true
  )
);
