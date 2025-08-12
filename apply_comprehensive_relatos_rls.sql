-- Drop all existing INSERT policies on public.relatos to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated users to create relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow users to create relatos based on authentication status" ON public.relatos;
DROP POLICY IF EXISTS "Allow any user to create anonymous relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow_Anon_Insert_All_Bare_Minimum" ON public.relatos;
DROP POLICY IF EXISTS "Allow all inserts to relatos" ON public.relatos;

-- Create the comprehensive policy for INSERT operations on public.relatos
CREATE POLICY "Allow users to create relatos based on authentication status"
ON public.relatos
FOR INSERT
TO public -- Apply to all roles (authenticated and anon)
WITH CHECK (
    (auth.uid() IS NOT NULL AND is_anonymous = FALSE AND user_id = auth.uid()) OR -- Authenticated users creating identified reports
    (auth.uid() IS NOT NULL AND is_anonymous = TRUE AND user_id = auth.uid()) OR -- Authenticated users creating anonymous reports (linked to their ID)
    (auth.uid() IS NULL AND is_anonymous = TRUE AND user_id IS NULL) -- Unauthenticated users creating anonymous reports
);

-- Ensure the anon role has basic INSERT permission
GRANT INSERT ON public.relatos TO anon;