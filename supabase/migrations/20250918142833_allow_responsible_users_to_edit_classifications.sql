-- Drop the old policy
DROP POLICY "Allow modification if user is the relato author or admin" ON public.relato_classificacoes;

-- Create the new, more permissive policy
CREATE POLICY "Allow modification for author, admin, responsible, or manager"
ON public.relato_classificacoes
FOR ALL
TO authenticated
USING (
    (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
    (get_my_claim('user_role'::text) = '"admin"'::jsonb) OR
    (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
    ((SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = true)
)
WITH CHECK (
    (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
    (get_my_claim('user_role'::text) = '"admin"'::jsonb) OR
    (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
    ((SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = true)
);
