
-- Creates a function to get all necessary details for a single relato view in one query.
CREATE OR REPLACE FUNCTION public.get_relato_details(p_relato_id uuid)
RETURNS TABLE (
    id uuid,
    created_at timestamp with time zone,
    user_id uuid,
    is_anonymous boolean,
    local_ocorrencia text,
    data_ocorrencia date,
    hora_aproximada_ocorrencia time without time zone,
    descricao text,
    riscos_identificados text,
    danos_ocorridos text,
    status text,
    planejamento_cronologia_solucao text,
    data_conclusao_solucao date,
    relato_code text,
    tipo_relato text,
    concluido_sem_data boolean,
    reproval_reason text, -- Added this column which was missing from previous attempts
    relator_full_name text,
    relator_avatar_url text,
    responsaveis jsonb,
    images jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.created_at,
        r.user_id,
        r.is_anonymous,
        r.local_ocorrencia,
        r.data_ocorrencia,
        r.hora_aproximada_ocorrencia,
        r.descricao,
        r.riscos_identificados,
        r.danos_ocorridos,
        r.status,
        r.planejamento_cronologia_solucao,
        r.data_conclusao_solucao,
        r.relato_code,
        r.tipo_relato,
        r.concluido_sem_data,
        r.reproval_reason,
        p.full_name AS relator_full_name,
        p.avatar_url AS relator_avatar_url,
        -- Aggregate responsible users into a JSON array
        (SELECT jsonb_agg(jsonb_build_object('id', resp_p.id, 'full_name', resp_p.full_name))
         FROM public.relato_responsaveis rr
         JOIN public.profiles resp_p ON rr.user_id = resp_p.id
         WHERE rr.relato_id = r.id) AS responsaveis,
        -- Aggregate images into a JSON array
        (SELECT jsonb_agg(jsonb_build_object('id', ri.id, 'image_url', ri.image_url, 'order_index', ri.order_index) ORDER BY ri.order_index)
         FROM public.relato_images ri
         WHERE ri.relato_id = r.id) AS images
    FROM
        public.relatos r
    LEFT JOIN
        public.profiles p ON r.user_id = p.id
    WHERE
        r.id = p_relato_id;
END;
$$;

-- Grant permissions for the new function
GRANT EXECUTE ON FUNCTION public.get_relato_details(uuid) TO anon, authenticated;
