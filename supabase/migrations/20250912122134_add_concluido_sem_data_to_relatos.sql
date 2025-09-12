-- Add the new column to the relatos table
ALTER TABLE public.relatos
ADD COLUMN concluido_sem_data BOOLEAN DEFAULT FALSE;

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS update_relato_status_trigger ON public.relatos;
DROP FUNCTION IF EXISTS public.update_relato_status();

-- Update the get_dashboard_stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'totalAprovados', COUNT(*) FILTER (WHERE status = 'APROVADO'),
        'concluidos', COUNT(*) FILTER (WHERE status = 'APROVADO' AND (data_conclusao_solucao IS NOT NULL OR concluido_sem_data = TRUE)),
        'emAndamento', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NOT NULL AND data_conclusao_solucao IS NULL AND concluido_sem_data = FALSE),
        'semTratativa', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NULL AND data_conclusao_solucao IS NULL AND concluido_sem_data = FALSE),
        'pendenteAprovacao', COUNT(*) FILTER (WHERE status = 'PENDENTE')
    )
    INTO stats
    FROM public.relatos r
    WHERE (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
      AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date);

    RETURN stats;
END;
$function$;

-- Update the search_relatos_unaccented function
CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(p_search_term text DEFAULT NULL::text, p_status_filter text DEFAULT NULL::text, p_responsible_filter text DEFAULT NULL::text, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date, p_tipo_relato_filter text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, local_ocorrencia text, descricao text, riscos_identificados text, danos_ocorridos text, planejamento_cronologia_solucao text, status text, data_conclusao_solucao timestamp with time zone, relato_code text, is_anonymous boolean, tipo_relato text, data_ocorrencia timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
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
            final_query := final_query || ' AND (r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND r.concluido_sem_data = FALSE';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND r.concluido_sem_data = FALSE';
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

    final_query := final_query || ' ORDER BY r.created_at DESC';

    RETURN QUERY EXECUTE final_query;
END;
$function$;
