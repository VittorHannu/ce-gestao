-- 1. Habilita RLS na tabela de relatos se ainda não estiver habilitado
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- 2. Remove a política antiga e permissiva, se existir (melhor ser explícito)
-- Usamos DROP IF EXISTS para não dar erro se a política não existir.
DROP POLICY IF EXISTS "Public access for relatos" ON public.relatos;

-- 3. Política para inserção anônima
-- Permite que qualquer pessoa (anon) insira um relato, desde que não tente definir um user_id.
CREATE POLICY "Allow anonymous inserts" 
ON public.relatos 
FOR INSERT 
TO anon 
WITH CHECK (user_id IS NULL);

-- 4. Política para usuários autenticados
-- Permite que usuários logados gerenciem (vejam, insiram, atualizem, deletem) seus próprios relatos.
CREATE POLICY "Allow individual access for authenticated users" 
ON public.relatos 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
