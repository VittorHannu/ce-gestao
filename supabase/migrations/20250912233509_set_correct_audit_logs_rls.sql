-- Cria uma função auxiliar para verificar a permissão 'can_view_audit_logs' do usuário autenticado.
-- Esta abordagem é segura e encapsula a lógica de verificação de permissão.
CREATE OR REPLACE FUNCTION public.can_i_view_audit_logs()
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT can_view_audit_logs INTO has_permission
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Define a política de segurança correta para a tabela de auditoria (audit_logs).
CREATE POLICY "Allow authorized users to read audit logs"
ON public.audit_logs
FOR SELECT
USING (
  public.can_i_view_audit_logs() = TRUE
);

-- Garante que a RLS permaneça ativa na tabela.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
