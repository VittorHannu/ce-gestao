-- Tabela Unificada para Logs de Auditoria
-- Esta tabela foi projetada para ser um repositório central para todos os eventos de auditoria.
-- A abordagem de tabela única simplifica as consultas e a manutenção, 
-- enquanto o uso de JSONB para 'old_record' e 'new_record' oferece flexibilidade
-- para registrar o estado de diferentes tabelas sem alterar o schema do log.

CREATE TABLE public.audit_logs (
    -- Coluna de Identificação
    id BIGSERIAL PRIMARY KEY,

    -- Timestamp do Evento
    -- Captura o momento exato em que o evento ocorreu.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Informações do Ator (Quem realizou a ação)
    -- user_id referencia o usuário autenticado que realizou a ação.
    -- Pode ser NULL para ações iniciadas pelo sistema ou anônimas.
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Descrição da Ação (O que foi feito)
    -- 'action' é um texto descritivo, ex: 'INSERT', 'UPDATE', 'DELETE', 'LOGIN_SUCCESS'.
    action TEXT NOT NULL CHECK (char_length(action) > 0),

    -- Contexto do Alvo (O que foi afetado)
    -- 'table_name' armazena o nome da tabela que sofreu a alteração.
    table_name TEXT,
    -- 'record_id' armazena o identificador do registro específico que foi alterado.
    record_id UUID,

    -- Detalhes da Mudança (O que mudou)
    -- 'old_record' armazena o estado do registro ANTES da alteração (para UPDATE e DELETE).
    old_record JSONB,
    -- 'new_record' armazena o estado do registro DEPOIS da alteração (para INSERT e UPDATE).
    new_record JSONB,

    -- Metadados da Requisição
    -- 'ip_address' para rastreabilidade de segurança.
    ip_address INET
);

-- Comentários sobre a tabela para documentação no banco de dados.
COMMENT ON TABLE public.audit_logs IS 'Tabela centralizada para registrar todos os eventos de auditoria do sistema, incluindo alterações de dados e ações significativas do usuário.';
COMMENT ON COLUMN public.audit_logs.user_id IS 'O usuário que performou a ação. Nulo se for uma ação do sistema.';
COMMENT ON COLUMN public.audit_logs.action IS 'O tipo de ação realizada (ex: INSERT, UPDATE, LOGIN_SUCCESS).';
COMMENT ON COLUMN public.audit_logs.table_name IS 'A tabela que foi afetada pela ação.';
COMMENT ON COLUMN public.audit_logs.record_id IS 'O ID do registro que foi afetado.';
COMMENT ON COLUMN public.audit_logs.old_record IS 'O estado do registro antes da mudança (para UPDATEs e DELETEs).';
COMMENT ON COLUMN public.audit_logs.new_record IS 'O estado do registro depois da mudança (para INSERTs e UPDATEs).';

-- Índices para otimizar a performance das consultas de auditoria.
-- É comum filtrar logs por data, usuário ou tipo de ação.
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- Habilita a Segurança em Nível de Linha (RLS) para a tabela de auditoria.
-- Isso é um passo crucial para garantir a imutabilidade dos logs.
-- As políticas de RLS serão definidas em uma migração separada para garantir
-- que apenas o sistema possa inserir logs e ninguém possa alterá-los ou excluí-los.
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
