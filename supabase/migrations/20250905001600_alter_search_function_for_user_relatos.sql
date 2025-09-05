CREATE OR REPLACE FUNCTION "public"."search_relatos_unaccented"(
    "p_search_term" "text" DEFAULT NULL::"text",
    "p_status_filter" "text" DEFAULT NULL::"text",
    "p_responsible_filter" "text" DEFAULT NULL::"text",
    "p_start_date" "date" DEFAULT NULL::"date",
    "p_end_date" "date" DEFAULT NULL::"date",
    "p_tipo_relato_filter" "text" DEFAULT NULL::"text",
    "p_only_mine" boolean DEFAULT false
)
RETURNS TABLE(
    "id" "uuid",
    "created_at" timestamp with time zone,
    "local_ocorrencia" "text",
    "descricao" "text",
    "riscos_identificados" "text",
    "danos_ocorridos" "text",
    "planejamento_cronologia_solucao" "text",
    "status" "text",
    "data_conclusao_solucao" timestamp with time zone,
    "relato_code" "text",
    "is_anonymous" boolean,
    "tipo_relato" "text",
    "data_ocorrencia" timestamp with time zone
)
LANGUAGE "plpgsql"
SECURITY INVOKER
AS $$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
    final_query text;
BEGIN
    final_query := 'SELECT
        r.id,
        r.created_at,
        r.local_ocorrencia,
        r.descricao,
        r.riscos_identificados,
        r.danos_ocorridos,
        r.planejamento_cronologia_solucao,
        r.status,
        r.data_conclusao_solucao::TIMESTAMP WITH TIME ZONE,
        r.relato_code,
        r.is_anonymous,
        r.tipo_relato,
        r.data_ocorrencia::TIMESTAMP WITH TIME ZONE
    FROM public.relatos r WHERE 1=1';

    -- Aplica filtro de termo de pesquisa
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        final_query := final_query || ' AND (
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
            final_query := final_query || ' AND r.status = ' || quote_literal('APROVADO');
        ELSIF p_status_filter = 'PENDENTE' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('PENDENTE');
        ELSIF p_status_filter = 'REPROVADO' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('REPROVADO');
        ELSIF p_status_filter = 'CONCLUIDO' THEN
            final_query := final_query || ' AND r.data_conclusao_solucao IS NOT NULL';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL';
        END IF;
    END IF;

    -- Aplica filtro de tipo de relato (NOVO)
    IF p_tipo_relato_filter IS NOT NULL AND p_tipo_relato_filter != '' THEN
        IF p_tipo_relato_filter = 'Sem Classificação' THEN
            final_query := final_query || ' AND r.tipo_relato IS NULL';
        ELSE
            final_query := final_query || ' AND r.tipo_relato ILIKE ' || quote_literal(p_tipo_relato_filter);
        END IF;
    END IF;

    -- Aplica filtro de responsáveis
    IF p_responsible_filter IS NOT NULL AND p_responsible_filter != 'all' THEN
        IF p_responsible_filter = 'with_responsibles' THEN
            final_query := final_query || ' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        ELSIF p_responsible_filter = 'without_responsibles' THEN
            final_query := final_query || ' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        END IF;
    END IF;

    -- Aplica filtro de data
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        final_query := final_query || ' AND r.data_ocorrencia BETWEEN ' || quote_literal(p_start_date) || ' AND ' || quote_literal(p_end_date);
    END IF;

    -- Aplica filtro para relatos do próprio usuário
    IF p_only_mine THEN
        final_query := final_query || ' AND r.user_id = auth.uid()';
    END IF;

    final_query := final_query || ' ORDER BY r.created_at DESC';

    RETURN QUERY EXECUTE final_query;
END;
$$;