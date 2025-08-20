CREATE OR REPLACE FUNCTION public.get_relatos_count_by_type(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    tipo_relato TEXT,
    count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END AS tipo_relato,
        COUNT(r.id) AS count
    FROM
        public.relatos r
    WHERE
        (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
        AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date)
        AND r.status = 'APROVADO' -- Add this line to filter by approved status
    GROUP BY
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END
    ORDER BY
        count DESC;
END;
$$;

ALTER FUNCTION public.get_relatos_count_by_type(DATE, DATE) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_relatos_count_by_type(DATE, DATE) TO anon;
GRANT EXECUTE ON FUNCTION public.get_relatos_count_by_type(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_relatos_count_by_type(DATE, DATE) TO service_role;