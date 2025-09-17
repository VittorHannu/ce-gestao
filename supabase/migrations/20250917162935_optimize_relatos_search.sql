
-- Step 1: Add the new tsvector column to store the full-text search document
ALTER TABLE public.relatos
ADD COLUMN fts_document tsvector;

-- Step 2: Create a function to update the fts_document column
CREATE OR REPLACE FUNCTION public.update_relatos_fts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_document :=
        setweight(to_tsvector('portuguese', coalesce(NEW.relato_code, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.local_ocorrencia, '')), 'B') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.descricao, '')), 'C') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.riscos_identificados, '')), 'D') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.danos_ocorridos, '')), 'D') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.planejamento_cronologia_solucao, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a trigger to automatically update the fts_document on insert or update
CREATE TRIGGER relatos_fts_update_trigger
BEFORE INSERT OR UPDATE ON public.relatos
FOR EACH ROW
EXECUTE FUNCTION public.update_relatos_fts();

-- Step 4: Backfill the fts_document for existing data
-- This might take a moment on large tables
UPDATE public.relatos SET fts_document = 
    setweight(to_tsvector('portuguese', coalesce(relato_code, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(local_ocorrencia, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(descricao, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(riscos_identificados, '')), 'D') ||
    setweight(to_tsvector('portuguese', coalesce(danos_ocorridos, '')), 'D') ||
    setweight(to_tsvector('portuguese', coalesce(planejamento_cronologia_solucao, '')), 'D');

-- Step 5: Create a GIN index on the new fts_document column for fast searching
CREATE INDEX relatos_fts_document_idx ON public.relatos USING gin(fts_document);

-- Step 6: Drop the old, inefficient function
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text, text, date, date, text, boolean, integer, integer, uuid);

-- Step 7: Recreate the search function with optimizations
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
        -- Replace spaces with '&' for "AND" logic in FTS
        v_search_query := to_tsquery('portuguese', array_to_string(string_to_array(trim(p_search_term), ' '), ' & '));
    END IF;

    RETURN QUERY
    WITH filtered_relatos AS (
        SELECT 
            r.id,
            -- Calculate total count efficiently using a window function
            COUNT(*) OVER() AS total_rows
        FROM 
            public.relatos r
        LEFT JOIN 
            public.relato_responsaveis rr ON r.id = rr.relato_id AND p_responsible_filter = 'with_responsibles'
        WHERE
            -- Full-Text Search (fast)
            (v_search_query IS NULL OR r.fts_document @@ v_search_query)

            -- Status Filter (optimized conditions)
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
        GROUP BY r.id
        ORDER BY r.created_at DESC
    )
    SELECT 
        r.id,
        r.created_at,
        r.local_ocorrencia,
        r.descricao,
        r.riscos_identificados,
        r.danos_ocorridos,
        r.planejamento_cronologia_solucao,
        r.status,
        r.data_conclusao_solucao,
        r.relato_code,
        r.is_anonymous,
        r.tipo_relato,
        r.data_ocorrencia,
        r.concluido_sem_data,
        (SELECT total_rows FROM filtered_relatos LIMIT 1) AS total_count
    FROM 
        public.relatos r
    JOIN 
        filtered_relatos fr ON r.id = fr.id
    ORDER BY 
        r.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;

END;
$$;
