SELECT
    CASE
        WHEN tipo_relato IS NULL THEN 'NULL_CLASSIFICATION'
        WHEN tipo_relato = '' THEN 'EMPTY_STRING_CLASSIFICATION'
        ELSE tipo_relato
    END AS classification_type,
    COUNT(*) AS count
FROM
    public.relatos
GROUP BY
    classification_type
ORDER BY
    count DESC;