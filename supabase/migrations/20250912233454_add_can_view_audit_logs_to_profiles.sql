-- Adiciona a coluna 'can_view_audit_logs' à tabela de perfis, seguindo o padrão de permissões do projeto.
ALTER TABLE public.profiles
ADD COLUMN can_view_audit_logs BOOLEAN NOT NULL DEFAULT FALSE;

-- Comentário para documentação da nova coluna.
COMMENT ON COLUMN public.profiles.can_view_audit_logs IS 'Permite que o usuário visualize a página de logs de auditoria.';
