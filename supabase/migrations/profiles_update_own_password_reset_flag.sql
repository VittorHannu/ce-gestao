CREATE POLICY "profiles_update_own_password_reset_flag"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = profiles.id) -- O usuário só pode atualizar a sua própria linha
WITH CHECK (
  -- Apenas permite que 'needs_password_reset' mude de TRUE para FALSE
  NEW.needs_password_reset = FALSE AND OLD.needs_password_reset = TRUE AND
  -- Garante que todas as outras colunas sensíveis permaneçam inalteradas
  NEW.email = OLD.email AND
  NEW.full_name = OLD.full_name AND -- Remova esta linha se quiser permitir que o usuário altere o próprio nome completo
  NEW.is_active = OLD.is_active AND
  NEW.can_manage_relatos = OLD.can_manage_relatos AND
  NEW.can_view_users = OLD.can_view_users AND
  NEW.can_create_users = OLD.can_create_users AND
  NEW.can_delete_users = OLD.can_delete_users AND
  NEW.can_view_feedbacks = OLD.can_view_feedbacks AND
  NEW.can_delete_relatos = OLD.can_delete_relatos AND
  NEW.can_manage_users = OLD.can_manage_users AND
  NEW.created_at = OLD.created_at AND
  NEW.id = OLD.id
);
