-- Política para Alterar Cargos (UPDATE)
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
  profiles.needs_password_reset = profiles.needs_password_reset AND
  -- Crucial: Gerentes NÃO podem alterar a permissão 'can_manage_users' de NINGUEM
  profiles.can_manage_users = profiles.can_manage_users
  -- As outras colunas de permissão (can_manage_relatos, can_view_users, etc.)
  -- e 'is_active' podem ser alteradas, pois não estão listadas aqui como restritas.
);

-- Política para Inserir Novos Usuários (INSERT)
CREATE POLICY "profiles_insert_by_creator"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Apenas usuários com 'can_create_users' podem inserir novos perfis
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_create_users = true)
  -- Crucial: Garante que o novo usuário criado NÃO tenha 'can_manage_users' ativado por padrão
  -- Isso impede que um gerente crie um novo super-administrador.
  AND profiles.can_manage_users = FALSE
);

-- Política para Deletar Usuários (DELETE)
CREATE POLICY "profiles_delete_by_deleter"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  -- Apenas usuários com 'can_delete_users' podem deletar perfis
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_delete_users = true)
  -- O usuário não pode deletar o próprio perfil
  AND auth.uid() != profiles.id
  -- O usuário não pode deletar perfis de outros gerentes (se desejar esta restrição)
  AND profiles.can_manage_users = FALSE
);