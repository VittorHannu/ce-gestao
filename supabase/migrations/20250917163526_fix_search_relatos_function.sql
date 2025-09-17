
-- Recreate the search function with the corrected structure
CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(
    p_search_term text DEFAULT NULL,
    p_status_filter text DEFAULT NULL,
    p_responsible_filter text DEFAULT NULL,
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL,
    p_tipo_relato_filter text DEFAULT NULL,
    p_only_mine boolean DEFAULT false,
    p_page_number integer DEFAULT 1,
    p_page_size integer DEFAULT 10,
    p_assigned_to_user_id uuid DEFAULT NULL
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
    concluido_sem_data boolean,
    total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset integer := (p_page_number - 1) * p_page_size;
    v_search_query tsquery;
BEGIN
    -- Build the full-text search query from the search term
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        v_search_query := to_tsquery('portuguese', array_to_string(string_to_array(trim(p_search_term), ' '), ' & '));
    END IF;

    RETURN QUERY
    WITH filtered_relatos AS (
        SELECT 
            r.*,
            COUNT(*) OVER() AS total_rows
        FROM 
            public.relatos r
        WHERE
            -- Full-Text Search (fast)
            (v_search_query IS NULL OR r.fts_document @@ v_search_query)

            -- Status Filter
            AND (p_status_filter IS NULL OR 
                (p_status_filter = 'APROVADO' AND r.status = 'APROVADO') OR
                (p_status_filter = 'PENDENTE' AND r.status = 'PENDENTE') OR
                (p_status_filter = 'REPROVADO' AND r.status = 'REPROVADO') OR
                (p_status_filter = 'CONCLUIDO' AND r.status = 'APROVADO' AND (r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)) OR
                (p_status_filter = 'EM_ANDAMENTO' AND r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND COALESCE(r.concluido_sem_data, FALSE) = FALSE) OR
                (p_status_filter = 'SEM_TRATATIVA' AND r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND COALESCE(r.concluido_sem_data, FALSE) = FALSE)
            )

            -- Tipo Relato Filter
            AND (p_tipo_relato_filter IS NULL OR
                (p_tipo_relato_filter = 'Sem Classificação' AND r.tipo_relato IS NULL) OR
                (p_tipo_relato_filter != 'Sem Classificação' AND r.tipo_relato ILIKE p_tipo_relato_filter)
            )

            -- Responsible Filter
            AND (p_responsible_filter IS NULL OR p_responsible_filter = 'all' OR
                (p_responsible_filter = 'with_responsibles' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr_exists WHERE rr_exists.relato_id = r.id)) OR
                (p_responsible_filter = 'without_responsibles' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr_exists WHERE rr_exists.relato_id = r.id))
            )

            -- Date Filter
            AND (p_start_date IS NULL OR r.data_ocorrencia::date >= p_start_date)
            AND (p_end_date IS NULL OR r.data_ocorrencia::date <= p_end_date)

            -- Only Mine Filter
            AND (p_only_mine = false OR r.user_id = auth.uid())

            -- Assigned to User Filter
            AND (p_assigned_to_user_id IS NULL OR r.id IN (SELECT rr_assigned.relato_id FROM public.relato_responsaveis rr_assigned WHERE rr_assigned.user_id = p_assigned_to_user_id))
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
        fr.data_conclusao_solucao,
        fr.relato_code,
        fr.is_anonymous,
        fr.tipo_relato,
        fr.data_ocorrencia,
        fr.concluido_sem_data,
        fr.total_rows AS total_count
    FROM 
        filtered_relatos fr
    ORDER BY 
        fr.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;

END;
$$;
