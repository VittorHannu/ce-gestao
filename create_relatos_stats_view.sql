DROP VIEW IF EXISTS public.relatos_stats;

CREATE OR REPLACE VIEW public.relatos_stats AS
SELECT
  COUNT(id) AS total_relatos,
  COUNT(CASE WHEN calculated_status = 'Em Andamento' THEN 1 ELSE NULL END) AS relatos_em_andamento,
  COUNT(CASE WHEN calculated_status = 'Concluído' THEN 1 ELSE NULL END) AS relatos_concluidos,
  COUNT(CASE WHEN calculated_status = 'Sem Tratativa' THEN 1 ELSE NULL END) AS relatos_sem_tratativa
FROM
  public.relatos_with_creator;
