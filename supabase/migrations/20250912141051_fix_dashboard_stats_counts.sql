CREATE OR REPLACE FUNCTION "public"."get_dashboard_stats"("p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS json
    LANGUAGE "plpgsql" SECURITY INVOKER
    AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'totalAprovados', COUNT(*) FILTER (WHERE status = 'APROVADO'),
        'concluidos', COUNT(*) FILTER (WHERE status = 'APROVADO' AND (data_conclusao_solucao IS NOT NULL OR concluido_sem_data = TRUE)),
        'emAndamento', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NOT NULL AND data_conclusao_solucao IS NULL AND (concluido_sem_data IS NULL OR concluido_sem_data = FALSE)),
        'semTratativa', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NULL AND data_conclusao_solucao IS NULL AND (concluido_sem_data IS NULL OR concluido_sem_data = FALSE)),
        'pendenteAprovacao', COUNT(*) FILTER (WHERE status = 'PENDENTE'),
        'myRelatosCount', COUNT(*) FILTER (WHERE user_id = auth.uid())
    )
    INTO stats
    FROM public.relatos r
    WHERE (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
      AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date);

    RETURN stats;
END;
$$;
