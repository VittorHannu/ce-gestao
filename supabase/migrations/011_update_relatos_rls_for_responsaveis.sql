DROP POLICY IF EXISTS "Allow admin to update relatos" ON public.relatos;

CREATE POLICY "Allow admin or responsible to update relatos" ON public.relatos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE)
    OR
    EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = id AND user_id = auth.uid())
  );
