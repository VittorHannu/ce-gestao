-- Step 1: Fix policies for 'classification_categories' table.
-- Drop the old, incorrect policy that relies on a non-existent 'admin' role claim.
DROP POLICY IF EXISTS "Admins can manage" ON public.classification_categories;

-- Create a new, correct policy that grants management permissions to users
-- with the 'can_manage_relatos' permission in their profile.
CREATE POLICY "Enable management for users with can_manage_relatos"
ON public.classification_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND can_manage_relatos = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND can_manage_relatos = true
  )
);


-- Step 2: Fix policies for 'relato_classificacoes' table.
-- Drop the old policy that contained a redundant and incorrect check for an 'admin' role claim.
DROP POLICY IF EXISTS "Allow modification for author, admin, responsible, or manager" ON public.relato_classificacoes;

-- Create a new, streamlined policy for modifying 'relato_classificacoes'.
-- This policy allows modification if the user is the author of the report,
-- is assigned as a responsible party, or has the 'can_manage_relatos' permission.
CREATE POLICY "Allow modification for author, responsible, or manager"
ON public.relato_classificacoes
FOR ALL
TO authenticated
USING (
  (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = true))
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM public.relatos WHERE id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relato_classificacoes.relato_id AND user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = true))
);

-- Step 3: Clean up the obsolete is_admin() function.
-- This function is a remnant of the old role-based system and is replaced by direct permission checks.
DROP FUNCTION IF EXISTS public.is_admin();
