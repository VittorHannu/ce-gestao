
CREATE OR REPLACE FUNCTION get_last_lost_time_accident_date()
RETURNS date
LANGUAGE sql
AS $$
  SELECT data_ocorrencia 
  FROM public.relatos 
  WHERE tipo_relato IN ('Acidente com afastamento', 'Fatal', 'Severo')
  ORDER BY data_ocorrencia DESC 
  LIMIT 1;
$$;
