-- 1. Adiciona a nova coluna de permissão na tabela de perfis.
ALTER TABLE public.profiles
ADD COLUMN can_view_all_relatos BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Remove a política de SELECT antiga e insegura.
-- ATENÇÃO: O nome da política "Allow all users to view all relatos" é uma suposição.
-- Se o nome real no seu painel Supabase for diferente, esta linha precisará ser ajustada.
DROP POLICY "Allow all users to view all relatos" ON public.relatos;

-- 3. Cria a nova política de SELECT segura e granular.
CREATE POLICY "Enable select for users based on permissions"
ON public.relatos
FOR SELECT
USING (
  -- Condição 1: O usuário tem a permissão explícita para ver todos os relatos.
  (SELECT can_view_all_relatos FROM public.profiles WHERE id = auth.uid()) = true
  OR
  -- Condição 2: O usuário é o criador do relato.
  (user_id = auth.uid())
  OR
  -- Condição 3: O usuário é um dos responsáveis pelo relato.
  EXISTS (
    SELECT 1
    FROM public.relato_responsaveis
    WHERE relato_responsaveis.relato_id = relatos.id
      AND relato_responsaveis.user_id = auth.uid()
  )
);
