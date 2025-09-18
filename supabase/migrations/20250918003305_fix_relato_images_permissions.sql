-- Drop the existing restrictive UPDATE and DELETE policies
DROP POLICY "Allow users to update their own relato_images" ON public.relato_images;
DROP POLICY "Allow users to delete their own relato_images" ON public.relato_images;

-- Create a new UPDATE policy that allows the author or a manager to update
CREATE POLICY "Allow update of relato_images by author or manager" ON public.relato_images
FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id)
  OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE can_manage_relatos = TRUE)
) WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id)
  OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE can_manage_relatos = TRUE)
);

-- Create a new DELETE policy that allows the author or a manager to delete
CREATE POLICY "Allow deletion of relato_images by author or manager" ON public.relato_images
FOR DELETE USING (
  auth.uid() IN (SELECT user_id FROM public.relatos WHERE id = relato_id)
  OR
  auth.uid() IN (SELECT id FROM public.profiles WHERE can_manage_relatos = TRUE)
);
