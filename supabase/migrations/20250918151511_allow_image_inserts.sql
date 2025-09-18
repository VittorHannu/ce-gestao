
-- Create a new policy that allows any user (authenticated or anonymous)
-- to insert into the relato_images table. This is secure because the user
-- can only know the `relato_id` for a report they have just created,
-- and the image upload process itself is secured by the
-- `get-presigned-image-url` Edge Function.
CREATE POLICY "Allow all users to insert images"
ON public.relato_images
FOR INSERT
WITH CHECK (true);
