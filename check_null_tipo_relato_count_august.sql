SELECT COUNT(*)
FROM public.relatos
WHERE tipo_relato IS NULL
AND data_ocorrencia >= '2025-08-01' AND data_ocorrencia <= '2025-08-31';