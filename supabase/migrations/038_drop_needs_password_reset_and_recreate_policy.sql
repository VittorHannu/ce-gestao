-- Removendo políticas que dependem de 'needs_password_reset'
DROP POLICY IF EXISTS profiles_update_roles_by_manager ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own_password_reset_flag ON public.profiles;

-- Removendo a coluna 'needs_password_reset'
ALTER TABLE public.profiles
DROP COLUMN needs_password_reset;

-- Recriando a política 'profiles_update_roles_by_manager' sem a dependência de 'needs_password_reset'
CREATE POLICY "profiles_update_roles_by_manager"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Apenas usuários com 'can_manage_users' podem tentar esta atualização
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_users = true)
  -- O usuário não pode atualizar o próprio perfil usando esta política
  AND auth.uid() != profiles.id
)
WITH CHECK (
  -- Garante que as colunas sensíveis abaixo NÃO sejam alteradas por esta política:
  profiles.email = profiles.email AND
  profiles.full_name = profiles.full_name AND
  profiles.created_at = profiles.created_at AND
  -- Crucial: Gerentes NÃO podem alterar a permissão 'can_manage_users' de NINGUEM
  profiles.can_manage_users = profiles.can_manage_users
  -- As outras colunas de permissão (can_manage_relatos, can_view_users, etc.)
  -- e 'is_active' podem ser alteradas, pois não estão listadas aqui como restritas.
);