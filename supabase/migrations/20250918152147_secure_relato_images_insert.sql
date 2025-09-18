
-- Drop the old, permissive policy that allowed all inserts.
DROP POLICY IF EXISTS "Allow all users to insert images" ON public.relato_images;

-- Create a new policy that denies all direct inserts to the relato_images table.
-- This forces all creations to go through the 'submit-relato' Edge Function,
-- which provides a single, secure, and controlled entry point.
CREATE POLICY "Deny all direct inserts to relato_images" 
ON public.relato_images 
FOR INSERT 
WITH CHECK (false);
