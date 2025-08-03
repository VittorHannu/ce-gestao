-- Adiciona política de RLS para permitir que administradores de relatos excluam relatos.
CREATE POLICY "Allow relato managers to delete any relato"
ON public.relatos
FOR DELETE
TO authenticated
USING ((SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = TRUE);
