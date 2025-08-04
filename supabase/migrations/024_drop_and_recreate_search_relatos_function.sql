-- Remove todas as versões da função search_relatos_unaccented para evitar conflitos
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text, text);
DROP FUNCTION IF EXISTS public.search_relatos_unaccented(text, text);

-- Recria a função search_relatos_unaccented com a lógica de filtro por responsáveis usando EXISTS/NOT EXISTS
CREATE OR REPLACE FUNCTION public.search_relatos_unaccented(
    p_search_term text DEFAULT ''::text,
    p_status_filter text DEFAULT NULL::text,
    p_responsible_filter text DEFAULT 'all'::text -- 'all', 'with_responsibles', 'without_responsibles'
)
RETURNS SETOF public.relatos
LANGUAGE plpgsql
AS $function$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
BEGIN
    RETURN QUERY
    SELECT r.*
    FROM public.relatos r
    WHERE
        (p_search_term = '' OR
         unaccent(r.local_ocorrencia) ILIKE search_query OR
         unaccent(r.descricao) ILIKE search_query OR
         unaccent(r.riscos_identificados) ILIKE search_query OR
         unaccent(r.planejamento_cronologia_solucao) ILIKE search_query OR
         unaccent(r.danos_ocorridos) ILIKE search_query OR
         r.relato_code ILIKE search_query)
        AND
        (p_status_filter IS NULL OR r.status = p_status_filter)
        AND
        (
            (p_responsible_filter = 'all') OR
            (p_responsible_filter = 'with_responsibles' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)) OR
            (p_responsible_filter = 'without_responsibles' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id))
        )
    ORDER BY r.created_at DESC;
END;
$function$;