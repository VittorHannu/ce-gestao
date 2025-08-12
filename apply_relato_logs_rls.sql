-- Drop existing INSERT policies on public.relato_logs if any
DROP POLICY IF EXISTS "Allow authenticated users to create relato_logs" ON public.relato_logs;

-- Create a policy for INSERT operations on public.relato_logs
CREATE POLICY "Allow users to create relato_logs based on authentication status"
ON public.relato_logs
FOR INSERT
TO public -- Apply to all roles (authenticated and anon)
WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR -- Authenticated users creating logs
    (auth.uid() IS NULL AND user_id IS NULL) -- Unauthenticated users creating logs
);

-- Ensure the anon role has basic INSERT permission on relato_logs
GRANT INSERT ON public.relato_logs TO anon;