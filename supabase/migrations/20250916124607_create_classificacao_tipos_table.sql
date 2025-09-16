-- 1. Create the new classification table for "Tipos"
CREATE TABLE public.classificacao_tipos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ordem INTEGER
);

-- 2. Set up RLS for the new table
ALTER TABLE public.classificacao_tipos ENABLE ROW LEVEL SECURITY;

-- 3. Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON public.classificacao_tipos
FOR SELECT
TO authenticated
USING (true);

-- 4. Allow full access to users with the specific permission
CREATE POLICY "Allow full access for classification managers"
ON public.classificacao_tipos
FOR ALL
TO authenticated
USING (public.can_manage_classifications())
WITH CHECK (public.can_manage_classifications());
