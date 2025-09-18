
-- Drop the old, now-unused policies for inserting relatos.
DROP POLICY IF EXISTS "Allow authenticated users to insert their own relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow anonymous users to insert relatos" ON public.relatos;

-- Create a new policy that denies all direct inserts to the relatos table.
-- This forces all creations to go through the 'submit-relato' Edge Function,
-- which provides a single, secure, and controlled entry point.
CREATE POLICY "Deny all direct inserts" 
ON public.relatos 
FOR INSERT 
WITH CHECK (false);
