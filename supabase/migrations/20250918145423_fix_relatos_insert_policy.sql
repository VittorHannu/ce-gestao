-- Drop the existing policy that is too restrictive for authenticated users inserting relatos.
DROP POLICY IF EXISTS "Allow authenticated users to insert their own relatos" ON public.relatos;

-- Create a new policy that allows authenticated users to insert relatos
-- either as themselves (user_id matches auth.uid() and is_anonymous is false)
-- or anonymously (user_id is NULL and is_anonymous is true).
CREATE POLICY "Allow authenticated users to insert their own relatos"
ON public.relatos
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id AND is_anonymous = false) OR
  (user_id IS NULL AND is_anonymous = true)
);
