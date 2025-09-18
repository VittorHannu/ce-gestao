-- Limpeza: Remove todas as políticas de RLS existentes na tabela "relatos" para recomeçar.
DROP POLICY IF EXISTS "Admins can manage relato responsibles" ON public.relatos;
DROP POLICY IF EXISTS "Allow all authenticated users to view all profiles (fixed)" ON public.relatos;
DROP POLICY IF EXISTS "Allow all users to insert relatos" ON public.relatos;
DROP POLICY IF EXISTS "Allow anon select (but returns no rows)" ON public.relatos;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.relatos;
DROP POLICY IF EXISTS "Allow individual access for authenticated users" ON public.relatos;
DROP POLICY IF EXISTS "Allow update for managers or assigned responsibles" ON public.relatos;
DROP POLICY IF EXISTS "Allow users with can_delete_relatos permission to delete relato" ON public.relatos;
DROP POLICY IF EXISTS "Enable select for users based on permissions" ON public.relatos;

-- 1. Ativa a Segurança em Nível de Linha (RLS) para a tabela de relatos.
-- Nenhuma query funcionará até que políticas sejam definidas.
ALTER TABLE public.relatos ENABLE ROW LEVEL SECURITY;

-- 2. Política de INSERT: Permite a criação de relatos.
-- A verificação (WITH CHECK) garante que:
-- - Usuários não logados (anônimos) podem submeter relatos (user_id será NULL).
-- - Usuários logados podem submeter relatos em seu próprio nome (user_id será o seu auth.uid()).
CREATE POLICY "Allow anonymous and authenticated users to create reports"
ON public.relatos
FOR INSERT
WITH CHECK (
  (is_anonymous = true AND user_id IS NULL) OR
  (is_anonymous = false AND user_id = auth.uid())
);

-- 3. Política de SELECT: Define quem pode visualizar os relatos.
-- Um usuário pode ver um relato se UMA das seguintes condições for verdadeira:
--   a) Ele tem a permissão "can_view_all_relatos" em seu perfil.
--   b) Ele é o autor do relato.
--   c) Ele está listado como um responsável pelo relato na tabela "relato_responsaveis".
CREATE POLICY "Enable select for users based on permissions"
ON public.relatos
FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_view_all_relatos = true)) OR
  (user_id = auth.uid()) OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relatos.id AND user_id = auth.uid()))
);

-- 4. Política de UPDATE: Define quem pode atualizar os relatos.
-- Um usuário pode atualizar um relato se UMA das seguintes for verdadeira:
--   a) Ele tem a permissão "can_manage_relatos" em seu perfil.
--   b) Ele está listado como um responsável pelo relato.
CREATE POLICY "Allow update for managers or assigned responsibles"
ON public.relatos
FOR UPDATE
USING (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = true)) OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relatos.id AND user_id = auth.uid()))
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = true)) OR
  (EXISTS (SELECT 1 FROM public.relato_responsaveis WHERE relato_id = relatos.id AND user_id = auth.uid()))
);

-- 5. Política de DELETE: Define quem pode deletar os relatos.
-- Apenas usuários com a permissão "can_delete_relatos" em seu perfil podem deletar.
CREATE POLICY "Allow delete only for users with specific permission"
ON public.relatos
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_delete_relatos = true)
);
