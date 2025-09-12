CREATE OR REPLACE FUNCTION get_record_period_sem_acidentes()
RETURNS INTEGER AS $$
DECLARE
  max_period_entre_acidentes INTEGER;
  periodo_atual INTEGER;
  ultimo_acidente_data DATE;
BEGIN
  -- 1. Maior período histórico entre o primeiro e o último acidente
  WITH acidentes_com_afastamento AS (
    SELECT data_ocorrido
    FROM relatos
    WHERE classificacao IN ('Acidente com afastamento', 'Fatal', 'Severo') AND status = 'aprovado'
  )
  SELECT (MAX(data_ocorrido) - MIN(data_ocorrido)) INTO max_period_entre_acidentes
  FROM acidentes_com_afastamento;

  -- 2. Período atual desde o último acidente
  SELECT MAX(data_ocorrido) INTO ultimo_acidente_data
  FROM relatos
  WHERE classificacao IN ('Acidente com afastamento', 'Fatal', 'Severo') AND status = 'aprovado';

  IF ultimo_acidente_data IS NOT NULL THEN
    periodo_atual := current_date - ultimo_acidente_data;
  ELSE
    periodo_atual := 0;
  END IF;

  -- 3. Retornar o maior valor entre recorde histórico e atual
  RETURN GREATEST(COALESCE(max_period_entre_acidentes, 0), periodo_atual);
END;
$$ LANGUAGE plpgsql;