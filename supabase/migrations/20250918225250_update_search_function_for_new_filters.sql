-- Drop the old function variants if they exist
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text, text, date, date, text, boolean, integer, integer);
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text[], text[], date, date, text[], boolean, uuid, text, integer, integer);

-- Create the new, consolidated function
CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(
    p_search_term text DEFAULT NULL,
    p_status_filter text[] DEFAULT NULL,
    p_treatment_status_filter text[] DEFAULT NULL,
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL,
    p_tipo_relato_filter text[] DEFAULT NULL,
    p_only_mine boolean DEFAULT false,
    p_assigned_to_user_id uuid DEFAULT NULL,
    p_sort_by text DEFAULT 'created_at_desc',
    p_page_number integer DEFAULT 1,
    p_page_size integer DEFAULT 10
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
    data_conclusao_solucao date,
    relato_code text,
    is_anonymous boolean,
    tipo_relato text,
    data_ocorrencia date,
    concluido_sem_data boolean,
    user_full_name text,
    image_count bigint,
    comment_count bigint,
    total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    query_conditions text := 'WHERE 1=1';
    final_query text;
    v_offset integer;
    treatment_conditions text[] := ARRAY[]::text[];
BEGIN
    v_offset := (p_page_number - 1) * p_page_size;

    -- Search term filter
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        query_conditions := query_conditions || format(' AND (unaccent(r.descricao) ILIKE unaccent(%%L%%) OR unaccent(r.relato_code) ILIKE unaccent(%%L%%))', p_search_term, p_search_term);
    END IF;

    -- Status filter (array)
    IF p_status_filter IS NOT NULL AND array_length(p_status_filter, 1) > 0 THEN
        query_conditions := query_conditions || format(' AND r.status = ANY(%L)', p_status_filter);
    END IF;

    -- Treatment status filter (derived)
    IF p_treatment_status_filter IS NOT NULL AND array_length(p_treatment_status_filter, 1) > 0 THEN
        IF 'CONCLUIDO' = ANY(p_treatment_status_filter) THEN
            treatment_conditions := array_append(treatment_conditions, '(r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)');
        END IF;
        IF 'EM_ANDAMENTO' = ANY(p_treatment_status_filter) THEN
            treatment_conditions := array_append(treatment_conditions, '(r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE))');
        END IF;
        IF 'SEM_TRATATIVA' = ANY(p_treatment_status_filter) THEN
            treatment_conditions := array_append(treatment_conditions, '(r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE))');
        END IF;
        query_conditions := query_conditions || ' AND (' || array_to_string(treatment_conditions, ' OR ') || ')';
    END IF;

    -- Date filter
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        query_conditions := query_conditions || format(' AND r.data_ocorrencia BETWEEN %L AND %L', p_start_date, p_end_date);
    END IF;

    -- My Relatos filter
    IF p_only_mine THEN
        query_conditions := query_conditions || ' AND r.user_id = auth.uid()';
    END IF;

    -- Assigned to me filter
    IF p_assigned_to_user_id IS NOT NULL THEN
        query_conditions := query_conditions || format(' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id AND rr.user_id = %L)', p_assigned_to_user_id);
    END IF;

    final_query := '
        WITH filtered_relatos AS (
            SELECT r.id
            FROM public.relatos r
            ' || query_conditions || '
        )
        SELECT
            r.id, r.created_at, r.local_ocorrencia, r.descricao, r.riscos_identificados, r.danos_ocorridos,
            r.planejamento_cronologia_solucao, r.status, r.data_conclusao_solucao, r.relato_code, r.is_anonymous,
            r.tipo_relato, r.data_ocorrencia, r.concluido_sem_data,
            p.full_name as user_full_name,
            (SELECT count(*) FROM public.relato_images ri WHERE ri.relato_id = r.id) as image_count,
            (SELECT count(*) FROM public.relato_comentarios rc WHERE rc.relato_id = r.id) as comment_count,
            (SELECT COUNT(*) FROM filtered_relatos) AS total_count
        FROM public.relatos r
        LEFT JOIN public.profiles p ON r.user_id = p.id
        WHERE r.id IN (SELECT id FROM filtered_relatos)
        ORDER BY ' ||
        CASE 
            WHEN p_sort_by = 'created_at_asc' THEN 'r.created_at ASC'
            WHEN p_sort_by = 'data_ocorrencia_desc' THEN 'r.data_ocorrencia DESC, r.created_at DESC'
            ELSE 'r.created_at DESC' 
           END ||
        ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset;

    RETURN QUERY EXECUTE final_query;
END;
$$;