-- Drop the existing INSERT policy
DROP POLICY "Allow users to insert their own relato_images" ON public.relato_images;

-- Create a new INSERT policy that includes can_manage_relatos condition
CREATE POLICY "Allow users to insert their own relato_images or if they can manage relatos" ON public.relato_images
FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id)
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE can_manage_relatos = TRUE)
);
