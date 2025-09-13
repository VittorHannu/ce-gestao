-- Cria uma função auxiliar para obter o 'cargo' do usuário autenticado.
-- Isso simplifica a política RLS e a torna mais legível e segura.
CREATE OR REPLACE FUNCTION public.get_my_cargo()
RETURNS TEXT AS $$
DECLARE
  user_cargo TEXT;
BEGIN
  SELECT cargo INTO user_cargo
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN user_cargo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Define as políticas de segurança para a tabela de auditoria (audit_logs).
-- O objetivo é garantir que os logs sejam imutáveis e que apenas pessoal autorizado possa visualizá-los.

-- 1. Política de Leitura (SELECT)
-- Permite que apenas usuários com o cargo 'administrador' possam ler os registros de auditoria.
CREATE POLICY "Allow admins to read audit logs"
ON public.audit_logs
FOR SELECT
USING (
  public.get_my_cargo() = 'administrador'
);

-- 2. Políticas de Escrita (INSERT, UPDATE, DELETE)
-- Nenhuma política de INSERT, UPDATE ou DELETE é criada para garantir a imutabilidade.
-- As inserções são tratadas exclusivamente pela função de trigger `log_audit()`.

-- Ativa as políticas para a tabela.
-- A linha abaixo garante que a RLS, que já foi habilitada na migração da tabela,
-- continue ativa e aplique as políticas acima.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;