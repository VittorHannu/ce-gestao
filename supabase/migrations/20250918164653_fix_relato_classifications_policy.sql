-- 1. Drop the existing policy if it exists (more robust)
DROP POLICY IF EXISTS "Allow modification based on relato assignment and permissions" ON public.relato_classificacoes;

-- 2. Create the new, simpler policy that ONLY checks for the 'can_manage_relatos' permission
CREATE POLICY "Allow modification for managers"
ON public.relato_classificacoes
FOR ALL
TO authenticated
USING (
  (SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT can_manage_relatos FROM public.profiles WHERE id = auth.uid()) = true
);
