-- Habilita RLS na tabela
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- Drop todas as políticas existentes para garantir um estado limpo
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.relatos;
DROP POLICY IF EXISTS "Allow individual access for authenticated users" ON public.relatos;
DROP POLICY IF EXISTS "Allow anon select (but returns no rows)" ON public.relatos;

-- Política 1: Permite inserção anônima
-- Um usuário anônimo (anon) pode inserir um relato, mas apenas se o user_id for nulo.
CREATE POLICY "Allow anonymous inserts" 
ON public.relatos 
FOR INSERT 
TO anon 
WITH CHECK (user_id IS NULL);

-- Política 2: Permite que anônimos façam SELECT, mas não vejam nenhuma linha
-- Isso é necessário para que o comando de insert, que retorna a linha criada, funcione.
CREATE POLICY "Allow anon select (but returns no rows)" 
ON public.relatos 
FOR SELECT 
TO anon 
USING (false);

-- Política 3: Permite que usuários autenticados gerenciem seus próprios relatos e criem relatos anônimos
-- O USING controla quais linhas eles podem ver/modificar (apenas as suas).
-- O WITH CHECK controla quais linhas eles podem criar (para si mesmos ou anônimas).
CREATE POLICY "Allow individual access for authenticated users" 
ON public.relatos 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));
