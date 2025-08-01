CREATE OR REPLACE VIEW public.relatos_with_creator AS
SELECT
  r.*,
  p.full_name AS creator_name,
  CASE
    WHEN r.data_conclusao_solucao IS NOT NULL THEN 'Concluído'
    WHEN r.data_conclusao_solucao IS NULL AND r.planejamento_cronologia_solucao IS NOT NULL AND r.planejamento_cronologia_solucao != '' THEN 'Em Andamento'
    WHEN r.data_conclusao_solucao IS NULL AND (r.planejamento_cronologia_solucao IS NULL OR r.planejamento_cronologia_solucao = '') THEN 'Sem Tratativa'
  END AS calculated_status
FROM
  public.relatos AS r
LEFT JOIN
  public.profiles AS p ON r.criado_por = p.id;