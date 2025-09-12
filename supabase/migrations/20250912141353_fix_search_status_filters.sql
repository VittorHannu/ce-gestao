-- Corrigido: Dropping the old function before creating the new one to allow changing the return table structure.
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text, text, date, date, text, boolean, integer, integer);

-- Unifica a lógica de paginação, filtros de status e contagem total em uma única função.
CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(
    p_search_term text DEFAULT NULL::text,
    p_status_filter text DEFAULT NULL::text,
    p_responsible_filter text DEFAULT NULL::text,
    p_start_date date DEFAULT NULL::date,
    p_end_date date DEFAULT NULL::date,
    p_tipo_relato_filter text DEFAULT NULL::text,
    p_only_mine boolean DEFAULT false,
    p_page_number integer DEFAULT 1,
    p_page_size integer DEFAULT 20
)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    local_ocorrencia text,
    descricao text,
    riscos_identificados text,
    danos_ocorridos text,
    planejamento_cronologia_solucao text,
    status text,
    data_conclusao_solucao timestamp with time zone,
    relato_code text,
    is_anonymous boolean,
    tipo_relato text,
    data_ocorrencia timestamp with time zone,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
    query_conditions text := 'WHERE 1=1';
    final_query text;
    v_offset integer;
BEGIN
    v_offset := (p_page_number - 1) * p_page_size;

    -- Aplica filtro de termo de pesquisa
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        query_conditions := query_conditions || ' AND (
            unaccent(r.local_ocorrencia) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.descricao) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.riscos_identificados) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.danos_ocorridos) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.planejamento_cronologia_solucao) ILIKE ' || quote_literal(search_query) || ' OR
            r.relato_code ILIKE ' || quote_literal(search_query) || '
        )';
    END IF;

    -- Aplica filtro de status
    IF p_status_filter IS NOT NULL THEN
        IF p_status_filter = 'APROVADO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO');
        ELSIF p_status_filter = 'PENDENTE' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('PENDENTE');
        ELSIF p_status_filter = 'REPROVADO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('REPROVADO');
        ELSIF p_status_filter = 'CONCLUIDO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND (r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE)';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE)';
        END IF;
    END IF;

    -- Aplica filtro de tipo de relato
    IF p_tipo_relato_filter IS NOT NULL AND p_tipo_relato_filter != '' THEN
        IF p_tipo_relato_filter = 'Sem Classificação' THEN
            query_conditions := query_conditions || ' AND r.tipo_relato IS NULL';
        ELSE
            query_conditions := query_conditions || ' AND r.tipo_relato ILIKE ' || quote_literal(p_tipo_relato_filter);
        END IF;
    END IF;

    -- Aplica filtro de responsáveis
    IF p_responsible_filter IS NOT NULL AND p_responsible_filter != 'all' THEN
        IF p_responsible_filter = 'with_responsibles' THEN
            query_conditions := query_conditions || ' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        ELSIF p_responsible_filter = 'without_responsibles' THEN
            query_conditions := query_conditions || ' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        END IF;
    END IF;

    -- Aplica filtro de data
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        query_conditions := query_conditions || ' AND r.data_ocorrencia BETWEEN ' || quote_literal(p_start_date) || ' AND ' || quote_literal(p_end_date);
    END IF;

    -- Aplica filtro para relatos do próprio usuário
    IF p_only_mine THEN
        query_conditions := query_conditions || ' AND r.user_id = auth.uid()';
    END IF;

    final_query := '
        WITH filtered_relatos AS (
            SELECT *
            FROM public.relatos r
            ' || query_conditions || '
        )
        SELECT
            fr.id,
            fr.created_at,
            fr.local_ocorrencia,
            fr.descricao,
            fr.riscos_identificados,
            fr.danos_ocorridos,
            fr.planejamento_cronologia_solucao,
            fr.status,
            fr.data_conclusao_solucao::TIMESTAMP WITH TIME ZONE,
            fr.relato_code,
            fr.is_anonymous,
            fr.tipo_relato,
            fr.data_ocorrencia::TIMESTAMP WITH TIME ZONE,
            (SELECT COUNT(*) FROM filtered_relatos) AS total_count
        FROM filtered_relatos fr
        ORDER BY fr.created_at DESC
        LIMIT ' || p_page_size || ' OFFSET ' || v_offset;

    RETURN QUERY EXECUTE final_query;
END;
$function$;