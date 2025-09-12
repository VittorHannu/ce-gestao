CREATE OR REPLACE FUNCTION get_record_period_sem_acidentes()
RETURNS INTEGER AS $$
DECLARE
  max_period_entre_acidentes INTEGER;
  periodo_atual INTEGER;
  ultimo_acidente_data DATE;
BEGIN
  -- 1. Encontrar o período máximo entre acidentes passados
  WITH acidentes_com_afastamento AS (
    SELECT data_ocorrido
    FROM relatos
    WHERE classificacao IN ('Acidente com afastamento', 'Fatal', 'Severo') -- REMOVED STATUS CHECK FOR DEBUGGING
    ORDER BY data_ocorrido
  ),
  periodos AS (
    SELECT data_ocorrido - LAG(data_ocorrido, 1) OVER (ORDER BY data_ocorrido) AS dias_sem_acidentes
    FROM acidentes_com_afastamento
  )
  SELECT MAX(dias_sem_acidentes) INTO max_period_entre_acidentes
  FROM periodos;

  -- 2. Encontrar o período atual desde o último acidente
  SELECT MAX(data_ocorrido) INTO ultimo_acidente_data
  FROM relatos
  WHERE classificacao IN ('Acidente com afastamento', 'Fatal', 'Severo'); -- REMOVED STATUS CHECK FOR DEBUGGING

  IF ultimo_acidente_data IS NOT NULL THEN
    periodo_atual := current_date - ultimo_acidente_data;
  ELSE
    periodo_atual := 0;
  END IF;

  -- 3. Retornar o maior valor entre o recorde histórico e o período atual
  RETURN GREATEST(COALESCE(max_period_entre_acidentes, 0), periodo_atual);
END;
$$ LANGUAGE plpgsql;