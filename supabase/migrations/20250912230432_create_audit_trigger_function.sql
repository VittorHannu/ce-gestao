-- Função de Gatilho de Auditoria Genérica
-- Esta função é o coração do nosso sistema de auditoria automatizado.
-- Ela foi projetada para ser chamada por gatilhos (triggers) em qualquer tabela que precise de auditoria.
-- A função captura as alterações (INSERT, UPDATE, DELETE) e as registra na tabela 'audit_logs'.

CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER AS $$
DECLARE
    -- Variáveis para armazenar os dados do registro antes e depois da alteração.
    old_data JSONB;
    new_data JSONB;
    -- Variável para armazenar o ID do usuário autenticado.
    user_id UUID;
BEGIN
    -- Tenta obter o ID do usuário a partir do contexto de autenticação do Supabase.
    -- A função auth.uid() retorna o UUID do usuário logado na sessão atual.
    -- Se não houver usuário logado (ex: uma operação do sistema), o valor será NULL.
    user_id := auth.uid();

    -- Condicional para a operação de INSERT (criação de um novo registro).
    IF (TG_OP = 'INSERT') THEN
        -- 'new_data' recebe o novo registro completo em formato JSONB.
        new_data := to_jsonb(NEW);
        -- 'old_data' é nulo, pois não há estado anterior.
        old_data := NULL;

    -- Condicional para a operação de UPDATE (alteração de um registro existente).
    ELSIF (TG_OP = 'UPDATE') THEN
        -- 'new_data' recebe o registro com as alterações.
        new_data := to_jsonb(NEW);
        -- 'old_data' recebe o registro como ele era antes da alteração.
        old_data := to_jsonb(OLD);

    -- Condicional para a operação de DELETE (exclusão de um registro).
    ELSIF (TG_OP = 'DELETE') THEN
        -- 'new_data' é nulo, pois o registro não existe mais.
        new_data := NULL;
        -- 'old_data' recebe o registro que foi excluído.
        old_data := to_jsonb(OLD);
    END IF;

    -- Insere o evento de auditoria na tabela 'audit_logs'.
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_record,
        new_record
    )
    VALUES (
        user_id,                                -- O ID do usuário que fez a ação.
        TG_OP,                                  -- A operação: 'INSERT', 'UPDATE' ou 'DELETE'.
        TG_TABLE_NAME,                          -- O nome da tabela onde a ação ocorreu.
        COALESCE(NEW.id, OLD.id),               -- O ID do registro afetado.
        old_data,                               -- O estado do registro antes da mudança.
        new_data                                -- O estado do registro depois da mudança.
    );

    -- Retorna o registro (NEW para INSERT/UPDATE, OLD para DELETE) para que a operação original continue.
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação da função no banco de dados.
COMMENT ON FUNCTION public.log_audit() IS 'Função de gatilho genérica que registra alterações (INSERT, UPDATE, DELETE) em qualquer tabela na tabela audit_logs.';
