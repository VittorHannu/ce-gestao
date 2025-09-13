-- Adiciona a coluna 'cargo' à tabela de perfis para controle de acesso baseado em função.
ALTER TABLE public.profiles
ADD COLUMN cargo TEXT NOT NULL DEFAULT 'colaborador';

-- Comentário para documentação da nova coluna.
COMMENT ON COLUMN public.profiles.cargo IS 'Cargo do usuário, usado para controle de permissões (ex: administrador, colaborador, gestor).';
