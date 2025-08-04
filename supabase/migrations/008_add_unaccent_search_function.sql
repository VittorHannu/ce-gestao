CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(
    p_search_term TEXT,
    p_status_filter TEXT DEFAULT NULL
)
RETURNS SETOF public.relatos
LANGUAGE plpgsql SECURITY INVOKER
AS $$
DECLARE
    query_string TEXT;
    search_pattern TEXT;
BEGIN
    query_string := 'SELECT * FROM public.relatos WHERE 1=1';

    -- Aplica filtro de status se fornecido
    IF p_status_filter IS NOT NULL THEN
        IF p_status_filter = 'aprovado' THEN
            query_string := query_string || format(' AND status = %L', 'APROVADO');
        ELSIF p_status_filter = 'concluido' THEN
            query_string := query_string || ' AND data_conclusao_solucao IS NOT NULL';
        ELSIF p_status_filter = 'em_andamento' THEN
            query_string := query_string || ' AND planejamento_cronologia_solucao IS NOT NULL AND data_conclusao_solucao IS NULL';
        ELSIF p_status_filter = 'sem_tratativa' THEN
            query_string := query_string || ' AND planejamento_cronologia_solucao IS NULL AND data_conclusao_solucao IS NULL';
        END IF;
    END IF;

    -- Aplica termo de pesquisa se fornecido
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        search_pattern := '%' || p_search_term || '%';
        query_string := query_string || ' AND (
            unaccent(local_ocorrencia) ILIKE unaccent($1) OR
            unaccent(descricao) ILIKE unaccent($1) OR
            unaccent(riscos_identificados) ILIKE unaccent($1) OR
            unaccent(danos_ocorridos) ILIKE unaccent($1) OR
            unaccent(planejamento_cronologia_solucao) ILIKE unaccent($1)
        )';
        -- Executa a query passando search_pattern como parâmetro ($1)
        RETURN QUERY EXECUTE query_string || ' ORDER BY created_at DESC' USING search_pattern;
    ELSE
        -- Se não houver termo de pesquisa, executa apenas com o filtro de status
        RETURN QUERY EXECUTE query_string || ' ORDER BY created_at DESC';
    END IF;

END;
$$;
