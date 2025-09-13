-- Remove a política de segurança incorreta da tabela audit_logs.
DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;

-- Remove a função auxiliar que foi criada incorretamente.
DROP FUNCTION IF EXISTS public.get_my_cargo();
