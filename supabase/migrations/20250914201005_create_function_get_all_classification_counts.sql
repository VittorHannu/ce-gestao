
CREATE OR REPLACE FUNCTION get_all_classification_counts()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    counts JSON;
BEGIN
    SELECT json_object_agg(table_name, count)
    INTO counts
    FROM (
        SELECT 'classificacao_agentes' as table_name, COUNT(*) as count FROM public.classificacao_agentes
        UNION ALL
        SELECT 'classificacao_tarefas' as table_name, COUNT(*) as count FROM public.classificacao_tarefas
        UNION ALL
        SELECT 'classificacao_equipamentos' as table_name, COUNT(*) as count FROM public.classificacao_equipamentos
        UNION ALL
        SELECT 'classificacao_causas' as table_name, COUNT(*) as count FROM public.classificacao_causas
        UNION ALL
        SELECT 'classificacao_danos' as table_name, COUNT(*) as count FROM public.classificacao_danos
        UNION ALL
        SELECT 'classificacao_acoes_corretivas' as table_name, COUNT(*) as count FROM public.classificacao_acoes_corretivas
        UNION ALL
        SELECT 'classificacao_riscos' as table_name, COUNT(*) as count FROM public.classificacao_riscos
    ) AS all_counts;

    RETURN counts;
END;
$$;
