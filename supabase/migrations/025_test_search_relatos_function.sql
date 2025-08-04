-- Este script é apenas para teste e não deve ser mantido após a depuração.
-- Ele chama a função search_relatos_unaccented com os parâmetros que sua aplicação está usando.
-- Execute esta consulta no seu editor SQL do Supabase e verifique os resultados.

SELECT * FROM public.search_relatos_unaccented(
    p_search_term := '',
    p_status_filter := 'APROVADO',
    p_responsible_filter := 'all'
);
