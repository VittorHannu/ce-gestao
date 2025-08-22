
-- Drop the existing restrictive policy
DROP POLICY "Allow users with can_manage_relatos permission to update relato" ON public.relatos;

-- Create the new, correct policy
CREATE POLICY "Allow update for managers or assigned responsibles"
ON public.relatos
FOR UPDATE
USING (
  -- Users with the 'can_manage_relatos' permission can update any report
  ( (SELECT profiles.can_manage_relatos FROM public.profiles WHERE profiles.id = auth.uid()) )
  OR
  -- Users whose ID is in the 'responsaveis' array of the report can update it
  (EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = relatos.id AND rr.user_id = auth.uid()))
)
WITH CHECK (
  -- The same logic applies for the WITH CHECK clause
  ( (SELECT profiles.can_manage_relatos FROM public.profiles WHERE profiles.id = auth.uid()) )
  OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = relatos.id AND rr.user_id = auth.uid()))
);

-- Optional: A comment to explain the purpose of this policy
COMMENT ON POLICY "Allow update for managers or assigned responsibles" ON public.relatos
IS 'Allows users to update a report if they have the can_manage_relatos permission or if they are listed as a responsible party for that specific report.';
