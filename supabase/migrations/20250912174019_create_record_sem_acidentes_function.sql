create or replace function get_record_period_sem_acidentes()
returns integer as $$
declare
  record_days integer;
begin
  with acidentes_com_afastamento as (
    select data_ocorrido from relatos
    where classificacao = 'Com Afastamento' and status = 'aprovado'
    order by data_ocorrido
  ),
  periodos as (
    select
      data_ocorrido - lag(data_ocorrido, 1) over (order by data_ocorrido) as dias_sem_acidentes
    from acidentes_com_afastamento
  )
  select max(dias_sem_acidentes) into record_days
  from periodos;

  return record_days;
end;
$$ language plpgsql;