-- This is a test to diagnose the RLS issue.
-- It uses the simplest possible insert policy for anonymous users.

-- Habilita RLS na tabela
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- Drop todas as políticas existentes para garantir um estado limpo
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.relatos;
DROP POLICY IF EXISTS "Allow individual access for authenticated users" ON public.relatos;
DROP POLICY IF EXISTS "Allow anon select (but returns no rows)" ON public.relatos;

-- Política 1 (TESTE): Permite inserção anônima com a condição mais simples possível.
CREATE POLICY "Allow anonymous inserts" 
ON public.relatos 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política 2: Permite que anônimos façam SELECT, mas não vejam nenhuma linha.
CREATE POLICY "Allow anon select (but returns no rows)" 
ON public.relatos 
FOR SELECT 
TO anon 
USING (false);

-- Política 3: Mantém a política que sabemos que funciona para usuários autenticados.
CREATE POLICY "Allow individual access for authenticated users" 
ON public.relatos 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));
