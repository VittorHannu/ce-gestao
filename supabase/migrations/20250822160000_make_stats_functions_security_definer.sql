-- 1. Atualiza a função existente da Pirâmide de Bird para bypassar a RLS.
CREATE OR REPLACE FUNCTION public.get_relatos_count_by_type(
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL
)
RETURNS TABLE (
    tipo_relato text,
    total_count bigint,
    concluido_count bigint,
    em_andamento_count bigint,
    sem_tratativa_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER -- Adiciona a permissão especial para a função
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END AS tipo_relato,
        COUNT(r.id) AS total_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.data_conclusao_solucao IS NOT NULL THEN r.id END) AS concluido_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL THEN r.id END) AS em_andamento_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL THEN r.id END) AS sem_tratativa_count
    FROM
        public.relatos r
    WHERE
        (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
        AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date)
        AND r.status = 'APROVADO'
    GROUP BY
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END
    ORDER BY
        total_count DESC;
END;
$$;

-- 2. Cria a nova função para os cards da Home Page, já com a permissão especial.
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
    p_start_date date DEFAULT NULL,
    p_end_date date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Adiciona a permissão especial para a função
AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'totalAprovados', COUNT(*) FILTER (WHERE status = 'APROVADO'),
        'concluidos', COUNT(*) FILTER (WHERE status = 'APROVADO' AND data_conclusao_solucao IS NOT NULL),
        'emAndamento', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NOT NULL AND data_conclusao_solucao IS NULL),
        'semTratativa', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NULL AND data_conclusao_solucao IS NULL),
        'pendenteAprovacao', COUNT(*) FILTER (WHERE status = 'PENDENTE')
    )
    INTO stats
    FROM public.relatos r
    WHERE (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
      AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date);

    RETURN stats;
END;
$$;