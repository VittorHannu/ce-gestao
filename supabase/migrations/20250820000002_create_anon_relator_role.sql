-- 1. Drop old policies
DROP POLICY IF EXISTS "Allow admin or responsible to update relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow authenticated users to view all relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow can delete relatos to delete any relato" ON public.relatos;
DROP POLICY IF EXISTS "Allow relato managers to update any relato" ON public.relatos;
DROP POLICY IF EXISTS "Allow relato managers to view all relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow users to view their own relatos" ON public.relatos;
DROP POLICY IF EXISTS "TEMP_Allow_All_Anonymous_Inserts_V2" ON public.relatos;

-- 2. Drop and re-create the role
DROP ROLE IF EXISTS anon_relator;
CREATE ROLE anon_relator;

-- 3. Grant USAGE on schema public
GRANT USAGE ON SCHEMA public TO anon_relator;

-- 4. Grant INSERT permission on relatos table
GRANT INSERT ON TABLE public.relatos TO anon_relator;

-- 5. Grant SELECT permission on relatos table
GRANT SELECT ON TABLE public.relatos TO anon_relator;

-- 6. Enable RLS
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- 7. Create new RLS policies
CREATE POLICY "Allow all users to insert relatos"
ON public.relatos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all users to view all relatos"
ON public.relatos
FOR SELECT
USING (true);

CREATE POLICY "Allow users with can_delete_relatos permission to delete relatos"
ON public.relatos
FOR DELETE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE can_delete_relatos = true));

CREATE POLICY "Allow users with can_manage_relatos permission to update relatos"
ON public.relatos
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE can_manage_relatos = true));
