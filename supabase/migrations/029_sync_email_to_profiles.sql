-- Cria uma função para sincronizar o email da tabela auth.users para public.profiles
CREATE OR REPLACE FUNCTION public.sync_user_email_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se o email foi alterado
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

-- Cria um trigger na tabela auth.users que chama a função após a atualização do email
CREATE TRIGGER sync_email_on_user_update
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_email_to_profiles();

-- Opcional: Se você quiser que o trigger também funcione para inserções (novos usuários)
-- CREATE TRIGGER sync_email_on_user_insert
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.sync_user_email_to_profiles();
