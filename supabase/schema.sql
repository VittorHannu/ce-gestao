

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."approval_status" AS ENUM (
    'pendente',
    'aprovado',
    'reprovado'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_i_view_audit_logs"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT can_view_audit_logs INTO has_permission
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(has_permission, FALSE);
END;
$$;


ALTER FUNCTION "public"."can_i_view_audit_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_relato_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Se o status_aprovacao está sendo alterado
  IF OLD.status_aprovacao IS DISTINCT FROM NEW.status_aprovacao THEN
    -- E o usuário NÃO tem a permissão de aprovar relatos
    IF public.get_my_claim('can_approve_relatos') IS NOT TRUE THEN -- Alterado para usar a nova get_my_claim que retorna BOOLEAN
      RAISE EXCEPTION 'Permissão negada: Somente usuários com permissão de aprovação podem alterar o status do relato.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_relato_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_relatos_admin_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    is_current_user_admin BOOLEAN;
BEGIN
    -- Corrigido: Usando is_admin_relatos em vez de is_admin
    SELECT is_admin_relatos INTO is_current_user_admin FROM public.profiles WHERE id = auth.uid();

    IF NOT is_current_user_admin THEN
        -- Check if non-admin user is trying to change admin-only fields
        IF (NEW.tipo_incidente IS DISTINCT FROM OLD.tipo_incidente) OR
           (NEW.gravidade IS DISTINCT FROM OLD.gravidade) OR
           (NEW.responsaveis IS DISTINCT FROM OLD.responsaveis) OR
           (NEW.planejamento_cronologia_solucao IS DISTINCT FROM OLD.planejamento_cronologia_solucao) OR
           (NEW.data_conclusao_solucao IS DISTINCT FROM OLD.data_conclusao_solucao)
        THEN
            RAISE EXCEPTION 'Permissão negada: Somente administradores podem alterar campos de tipo de incidente, gravidade, responsáveis, planejamento/cronologia da solução e data de conclusão da solução.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_relatos_admin_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_relato_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_val BIGINT;
    current_year TEXT;
BEGIN
    -- Obtém o próximo valor da sequência
    SELECT nextval('relato_seq') INTO next_val;
    -- Obtém o ano atual
    SELECT to_char(now(), 'YYYY') INTO current_year;
    
    -- Formata o relato_code
    NEW.relato_code := 'REL' || current_year || LPAD(next_val::TEXT, 5, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_relato_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_stats"("p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS json
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claims', true), '')::jsonb->claim;
END;
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_record_sem_acidentes"() RETURNS TABLE("dias_atuais_sem_acidentes" integer, "recorde_dias_sem_acidentes" integer, "data_ultimo_acidente" "date")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    max_historical_interval INTEGER;
    current_interval INTEGER;
    last_accident_date DATE;
    accident_count INTEGER;
BEGIN
    -- Count the total number of accidents to determine if a record can even exist.
    SELECT count(*) INTO accident_count
    FROM public.relatos r
    WHERE r.tipo_relato IN ('Acidente com afastamento', 'Fatal', 'Severo');

    -- Step 1: Find the date of the last accident.
    SELECT MAX(r.data_ocorrencia) INTO last_accident_date
    FROM public.relatos r
    WHERE r.tipo_relato IN ('Acidente com afastamento', 'Fatal', 'Severo');

    -- Step 2: Calculate the current streak of days without accidents.
    IF last_accident_date IS NOT NULL THEN
        current_interval := (CURRENT_DATE - last_accident_date);
    ELSE
        -- Fallback if no accidents are recorded at all.
        -- Calculates days since the very first report of any kind.
        SELECT (CURRENT_DATE - MIN(r.created_at)::date) INTO current_interval
        FROM public.relatos r;
    END IF;

    -- Step 3: Calculate the historical record interval.
    WITH accident_dates AS (
        SELECT r.data_ocorrencia AS accident_date
        FROM public.relatos r
        WHERE r.tipo_relato IN ('Acidente com afastamento', 'Fatal', 'Severo')
        ORDER BY r.data_ocorrencia
    ),
    intervals AS (
        SELECT
            accident_date - lag(accident_date, 1) OVER (ORDER BY accident_date) AS interval_days
        FROM accident_dates
    )
    SELECT MAX(iv.interval_days) INTO max_historical_interval
    FROM intervals iv;

    -- Step 4: Define the return values with the corrected logic.
    dias_atuais_sem_acidentes := COALESCE(current_interval, 0);

    -- A record can only exist if there are at least 2 accidents to compare.
    IF accident_count < 2 THEN
        recorde_dias_sem_acidentes := 0; -- No record if less than 2 accidents
    ELSE
        -- If there are 2+ accidents, the record is the max interval between them.
        -- If max_historical_interval is null (which shouldn't happen with 2+ accidents), default to 0.
        recorde_dias_sem_acidentes := COALESCE(max_historical_interval, 0);
    END IF;

    data_ultimo_acidente := last_accident_date;

    RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."get_record_sem_acidentes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("tipo_relato" "text", "total_count" bigint, "concluido_count" bigint, "em_andamento_count" bigint, "sem_tratativa_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END AS tipo_relato,
        COUNT(r.id) AS total_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.data_conclusao_solucao IS NOT NULL THEN r.id END) AS concluido_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL THEN r.id END) AS em_andamento_count,
        COUNT(CASE WHEN r.status = 'APROVADO' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL THEN r.id END) AS sem_tratativa_count
    FROM
        public.relatos r
    WHERE
        (p_start_date IS NULL OR r.data_ocorrencia >= p_start_date)
        AND (p_end_date IS NULL OR r.data_ocorrencia <= p_end_date)
        AND r.status = 'APROVADO'
    GROUP BY
        CASE
            WHEN r.tipo_relato IS NULL THEN 'Sem Classificação'
            ELSE r.tipo_relato
        END
    ORDER BY
        total_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_or_update_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if the user already exists in public.profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- If user exists, update their full_name and email
    UPDATE public.profiles
    SET
      full_name = NEW.raw_user_meta_data->>'full_name',
      email = NEW.email
    WHERE id = NEW.id;
  ELSE
    -- If user does not exist, insert a new record
    INSERT INTO public.profiles (id, full_name, email, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks, can_delete_relatos, can_manage_users)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      TRUE, -- Default is_active to true
      FALSE, -- Default can_manage_relatos to false
      FALSE, -- Default can_view_users to false
      FALSE, -- Default can_create_users to false
      FALSE, -- Default can_delete_users to false
      FALSE, -- Default can_view_feedbacks to false
      FALSE, -- Default can_delete_relatos to false
      FALSE  -- Default can_manage_users to false
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_or_update_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("permission_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  claim_value JSONB;
BEGIN
  claim_value := public.get_my_claim(permission_name);
  IF claim_value IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN claim_value::boolean;
END;
$$;


ALTER FUNCTION "public"."has_permission"("permission_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invalidate_user_sessions_on_profile_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Invalida a sessão do usuário para que um novo JWT seja gerado no próximo login
  UPDATE auth.sessions
  SET invalidated_at = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."invalidate_user_sessions_on_profile_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_relatos = TRUE);
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSONB;
BEGIN
    -- Performs a FULL OUTER JOIN on the keys of both JSON objects
    -- to capture added, deleted, and modified fields in a single pass.
    SELECT jsonb_agg(
        jsonb_build_object(
            'field', COALESCE(k1, k2), -- The name of the field that changed
            'old', val1 -> COALESCE(k1, k2), -- The old value (will be null if field was added)
            'new', val2 -> COALESCE(k1, k2)  -- The new value (will be null if field was deleted)
        )
    )
    INTO result
    FROM jsonb_object_keys(val1) k1
    FULL OUTER JOIN jsonb_object_keys(val2) k2 ON k1 = k2
    -- The WHERE clause filters for keys where the value has actually changed.
    WHERE val1 -> COALESCE(k1, k2) IS DISTINCT FROM val2 -> COALESCE(k1, k2);

    -- Return the result, or an empty JSON array if no differences were found.
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") IS 'Compares two JSONB values and returns a JSONB array of objects, each detailing a field that was added, deleted, or changed.';



CREATE OR REPLACE FUNCTION "public"."log_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    -- Variáveis para armazenar os dados do registro antes e depois da alteração.
    old_data JSONB;
    new_data JSONB;
    -- Variável para armazenar o ID do usuário autenticado.
    user_id UUID;
BEGIN
    -- Tenta obter o ID do usuário a partir do contexto de autenticação do Supabase.
    -- A função auth.uid() retorna o UUID do usuário logado na sessão atual.
    -- Se não houver usuário logado (ex: uma operação do sistema), o valor será NULL.
    user_id := auth.uid();

    -- Condicional para a operação de INSERT (criação de um novo registro).
    IF (TG_OP = 'INSERT') THEN
        -- 'new_data' recebe o novo registro completo em formato JSONB.
        new_data := to_jsonb(NEW);
        -- 'old_data' é nulo, pois não há estado anterior.
        old_data := NULL;

    -- Condicional para a operação de UPDATE (alteração de um registro existente).
    ELSIF (TG_OP = 'UPDATE') THEN
        -- 'new_data' recebe o registro com as alterações.
        new_data := to_jsonb(NEW);
        -- 'old_data' recebe o registro como ele era antes da alteração.
        old_data := to_jsonb(OLD);

    -- Condicional para a operação de DELETE (exclusão de um registro).
    ELSIF (TG_OP = 'DELETE') THEN
        -- 'new_data' é nulo, pois o registro não existe mais.
        new_data := NULL;
        -- 'old_data' recebe o registro que foi excluído.
        old_data := to_jsonb(OLD);
    END IF;

    -- Insere o evento de auditoria na tabela 'audit_logs'.
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_record,
        new_record
    )
    VALUES (
        user_id,                                -- O ID do usuário que fez a ação.
        TG_OP,                                  -- A operação: 'INSERT', 'UPDATE' ou 'DELETE'.
        TG_TABLE_NAME,                          -- O nome da tabela onde a ação ocorreu.
        COALESCE(NEW.id, OLD.id),               -- O ID do registro afetado.
        old_data,                               -- O estado do registro antes da mudança.
        new_data                                -- O estado do registro depois da mudança.
    );

    -- Retorna o registro (NEW para INSERT/UPDATE, OLD para DELETE) para que a operação original continue.
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_audit"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."log_audit"() IS 'Função de gatilho genérica que registra alterações (INSERT, UPDATE, DELETE) em qualquer tabela na tabela audit_logs.';



CREATE OR REPLACE FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text" DEFAULT NULL::"text", "p_status_filter" "text" DEFAULT NULL::"text", "p_responsible_filter" "text" DEFAULT NULL::"text", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date", "p_tipo_relato_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "local_ocorrencia" "text", "descricao" "text", "riscos_identificados" "text", "danos_ocorridos" "text", "planejamento_cronologia_solucao" "text", "status" "text", "data_conclusao_solucao" timestamp with time zone, "relato_code" "text", "is_anonymous" boolean, "tipo_relato" "text", "data_ocorrencia" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
    final_query text;
BEGIN
    final_query := 'SELECT
        r.id,
        r.created_at,
        r.local_ocorrencia,
        r.descricao,
        r.riscos_identificados,
        r.danos_ocorridos,
        r.planejamento_cronologia_solucao,
        r.status,
        r.data_conclusao_solucao::TIMESTAMP WITH TIME ZONE,
        r.relato_code,
        r.is_anonymous,
        r.tipo_relato,
        r.data_ocorrencia::TIMESTAMP WITH TIME ZONE
    FROM public.relatos r WHERE 1=1';

    -- Aplica filtro de termo de pesquisa
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        final_query := final_query || ' AND (
            unaccent(r.local_ocorrencia) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.descricao) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.riscos_identificados) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.danos_ocorridos) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.planejamento_cronologia_solucao) ILIKE ' || quote_literal(search_query) || ' OR
            r.relato_code ILIKE ' || quote_literal(search_query) || '
        )';
    END IF;

    -- Aplica filtro de status
    IF p_status_filter IS NOT NULL THEN
        IF p_status_filter = 'APROVADO' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('APROVADO');
        ELSIF p_status_filter = 'PENDENTE' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('PENDENTE');
        ELSIF p_status_filter = 'REPROVADO' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('REPROVADO');
        ELSIF p_status_filter = 'CONCLUIDO' THEN
            final_query := final_query || ' AND (r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND r.concluido_sem_data = FALSE';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND r.concluido_sem_data = FALSE';
        END IF;
    END IF;

    -- Aplica filtro de tipo de relato (NOVO)
    IF p_tipo_relato_filter IS NOT NULL AND p_tipo_relato_filter != '' THEN
        IF p_tipo_relato_filter = 'Sem Classificação' THEN
            final_query := final_query || ' AND r.tipo_relato IS NULL';
        ELSE
            final_query := final_query || ' AND r.tipo_relato ILIKE ' || quote_literal(p_tipo_relato_filter);
        END IF;
    END IF;

    -- Aplica filtro de responsáveis
    IF p_responsible_filter IS NOT NULL AND p_responsible_filter != 'all' THEN
        IF p_responsible_filter = 'with_responsibles' THEN
            final_query := final_query || ' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        ELSIF p_responsible_filter = 'without_responsibles' THEN
            final_query := final_query || ' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        END IF;
    END IF;

    -- Aplica filtro de data
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        final_query := final_query || ' AND r.data_ocorrencia BETWEEN ' || quote_literal(p_start_date) || ' AND ' || quote_literal(p_end_date);
    END IF;

    final_query := final_query || ' ORDER BY r.created_at DESC';

    RETURN QUERY EXECUTE final_query;
END;
$$;


ALTER FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text" DEFAULT NULL::"text", "p_status_filter" "text" DEFAULT NULL::"text", "p_responsible_filter" "text" DEFAULT NULL::"text", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date", "p_tipo_relato_filter" "text" DEFAULT NULL::"text", "p_only_mine" boolean DEFAULT false) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "local_ocorrencia" "text", "descricao" "text", "riscos_identificados" "text", "danos_ocorridos" "text", "planejamento_cronologia_solucao" "text", "status" "text", "data_conclusao_solucao" timestamp with time zone, "relato_code" "text", "is_anonymous" boolean, "tipo_relato" "text", "data_ocorrencia" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
    final_query text;
BEGIN
    final_query := 'SELECT
        r.id,
        r.created_at,
        r.local_ocorrencia,
        r.descricao,
        r.riscos_identificados,
        r.danos_ocorridos,
        r.planejamento_cronologia_solucao,
        r.status,
        r.data_conclusao_solucao::TIMESTAMP WITH TIME ZONE,
        r.relato_code,
        r.is_anonymous,
        r.tipo_relato,
        r.data_ocorrencia::TIMESTAMP WITH TIME ZONE
    FROM public.relatos r WHERE 1=1';

    -- Aplica filtro de termo de pesquisa
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        final_query := final_query || ' AND (
            unaccent(r.local_ocorrencia) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.descricao) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.riscos_identificados) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.danos_ocorridos) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.planejamento_cronologia_solucao) ILIKE ' || quote_literal(search_query) || ' OR
            r.relato_code ILIKE ' || quote_literal(search_query) || ' 
        )';
    END IF;

    -- Aplica filtro de status
    IF p_status_filter IS NOT NULL THEN
        IF p_status_filter = 'APROVADO' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('APROVADO');
        ELSIF p_status_filter = 'PENDENTE' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('PENDENTE');
        ELSIF p_status_filter = 'REPROVADO' THEN
            final_query := final_query || ' AND r.status = ' || quote_literal('REPROVADO');
        ELSIF p_status_filter = 'CONCLUIDO' THEN
            final_query := final_query || ' AND r.data_conclusao_solucao IS NOT NULL';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            final_query := final_query || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL';
        END IF;
    END IF;

    -- Aplica filtro de tipo de relato (NOVO)
    IF p_tipo_relato_filter IS NOT NULL AND p_tipo_relato_filter != '' THEN
        IF p_tipo_relato_filter = 'Sem Classificação' THEN
            final_query := final_query || ' AND r.tipo_relato IS NULL';
        ELSE
            final_query := final_query || ' AND r.tipo_relato ILIKE ' || quote_literal(p_tipo_relato_filter);
        END IF;
    END IF;

    -- Aplica filtro de responsáveis
    IF p_responsible_filter IS NOT NULL AND p_responsible_filter != 'all' THEN
        IF p_responsible_filter = 'with_responsibles' THEN
            final_query := final_query || ' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        ELSIF p_responsible_filter = 'without_responsibles' THEN
            final_query := final_query || ' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        END IF;
    END IF;

    -- Aplica filtro de data
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        final_query := final_query || ' AND r.data_ocorrencia BETWEEN ' || quote_literal(p_start_date) || ' AND ' || quote_literal(p_end_date);
    END IF;

    -- Aplica filtro para relatos do próprio usuário
    IF p_only_mine THEN
        final_query := final_query || ' AND r.user_id = auth.uid()';
    END IF;

    final_query := final_query || ' ORDER BY r.created_at DESC';

    RETURN QUERY EXECUTE final_query;
END;
$$;


ALTER FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text" DEFAULT NULL::"text", "p_status_filter" "text" DEFAULT NULL::"text", "p_responsible_filter" "text" DEFAULT NULL::"text", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date", "p_tipo_relato_filter" "text" DEFAULT NULL::"text", "p_only_mine" boolean DEFAULT false, "p_page_number" integer DEFAULT 1, "p_page_size" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "local_ocorrencia" "text", "descricao" "text", "riscos_identificados" "text", "danos_ocorridos" "text", "planejamento_cronologia_solucao" "text", "status" "text", "data_conclusao_solucao" timestamp with time zone, "relato_code" "text", "is_anonymous" boolean, "tipo_relato" "text", "data_ocorrencia" timestamp with time zone, "concluido_sem_data" boolean, "total_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    search_query text := '%' || unaccent(p_search_term) || '%';
    query_conditions text := 'WHERE 1=1';
    final_query text;
    v_offset integer;
BEGIN
    v_offset := (p_page_number - 1) * p_page_size;

    -- Aplica filtro de termo de pesquisa
    IF p_search_term IS NOT NULL AND p_search_term != '' THEN
        query_conditions := query_conditions || ' AND (
            unaccent(r.local_ocorrencia) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.descricao) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.riscos_identificados) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.danos_ocorridos) ILIKE ' || quote_literal(search_query) || ' OR
            unaccent(r.planejamento_cronologia_solucao) ILIKE ' || quote_literal(search_query) || ' OR
            r.relato_code ILIKE ' || quote_literal(search_query) || '
        )';
    END IF;

    -- Aplica filtro de status
    IF p_status_filter IS NOT NULL THEN
        IF p_status_filter = 'APROVADO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO');
        ELSIF p_status_filter = 'PENDENTE' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('PENDENTE');
        ELSIF p_status_filter = 'REPROVADO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('REPROVADO');
        ELSIF p_status_filter = 'CONCLUIDO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND (r.data_conclusao_solucao IS NOT NULL OR r.concluido_sem_data = TRUE)';
        ELSIF p_status_filter = 'EM_ANDAMENTO' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND r.planejamento_cronologia_solucao IS NOT NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE)';
        ELSIF p_status_filter = 'SEM_TRATATIVA' THEN
            query_conditions := query_conditions || ' AND r.status = ' || quote_literal('APROVADO') || ' AND r.planejamento_cronologia_solucao IS NULL AND r.data_conclusao_solucao IS NULL AND (r.concluido_sem_data IS NULL OR r.concluido_sem_data = FALSE)';
        END IF;
    END IF;

    -- Aplica filtro de tipo de relato
    IF p_tipo_relato_filter IS NOT NULL AND p_tipo_relato_filter != '' THEN
        IF p_tipo_relato_filter = 'Sem Classificação' THEN
            query_conditions := query_conditions || ' AND r.tipo_relato IS NULL';
        ELSE
            query_conditions := query_conditions || ' AND r.tipo_relato ILIKE ' || quote_literal(p_tipo_relato_filter);
        END IF;
    END IF;

    -- Aplica filtro de responsáveis
    IF p_responsible_filter IS NOT NULL AND p_responsible_filter != 'all' THEN
        IF p_responsible_filter = 'with_responsibles' THEN
            query_conditions := query_conditions || ' AND EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        ELSIF p_responsible_filter = 'without_responsibles' THEN
            query_conditions := query_conditions || ' AND NOT EXISTS (SELECT 1 FROM public.relato_responsaveis rr WHERE rr.relato_id = r.id)';
        END IF;
    END IF;

    -- Aplica filtro de data
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
        query_conditions := query_conditions || ' AND r.data_ocorrencia BETWEEN ' || quote_literal(p_start_date) || ' AND ' || quote_literal(p_end_date);
    END IF;

    -- Aplica filtro para relatos do próprio usuário
    IF p_only_mine THEN
        query_conditions := query_conditions || ' AND r.user_id = auth.uid()';
    END IF;

    final_query := '
        WITH filtered_relatos AS (
            SELECT *
            FROM public.relatos r
            ' || query_conditions || '
        )
        SELECT
            fr.id,
            fr.created_at,
            fr.local_ocorrencia,
            fr.descricao,
            fr.riscos_identificados,
            fr.danos_ocorridos,
            fr.planejamento_cronologia_solucao,
            fr.status,
            fr.data_conclusao_solucao::TIMESTAMP WITH TIME ZONE,
            fr.relato_code,
            fr.is_anonymous,
            fr.tipo_relato,
            fr.data_ocorrencia::TIMESTAMP WITH TIME ZONE,
            fr.concluido_sem_data, -- Adicionado
            (SELECT COUNT(*) FROM filtered_relatos) AS total_count
        FROM filtered_relatos fr
        ORDER BY fr.created_at DESC
        LIMIT ' || p_page_size || ' OFFSET ' || v_offset;

    RETURN QUERY EXECUTE final_query;
END;
$$;


ALTER FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean, "p_page_number" integer, "p_page_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_email_to_profiles"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verifica se o email foi alterado
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_email_to_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_relato_responsaveis"("p_relato_id" "uuid", "p_user_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Etapa 1: Remove todos os responsáveis existentes para o relato informado.
    DELETE FROM public.relato_responsaveis
    WHERE relato_id = p_relato_id;

    -- Etapa 2: Insere a nova lista de responsáveis a partir do array fornecido.
    -- A função unnest expande o array em um conjunto de linhas.
    IF array_length(p_user_ids, 1) > 0 THEN
        INSERT INTO public.relato_responsaveis (relato_id, user_id)
        SELECT p_relato_id, unnested_user_id
        FROM unnest(p_user_ids) AS unnested_user_id;
    END IF;
END;
$$;


ALTER FUNCTION "public"."update_relato_responsaveis"("p_relato_id" "uuid", "p_user_ids" "uuid"[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "old_record" "jsonb",
    "new_record" "jsonb",
    "ip_address" "inet",
    CONSTRAINT "audit_logs_action_check" CHECK (("char_length"("action") > 0))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Tabela centralizada para registrar todos os eventos de auditoria do sistema, incluindo alterações de dados e ações significativas do usuário.';



COMMENT ON COLUMN "public"."audit_logs"."user_id" IS 'O usuário que performou a ação. Nulo se for uma ação do sistema.';



COMMENT ON COLUMN "public"."audit_logs"."action" IS 'O tipo de ação realizada (ex: INSERT, UPDATE, LOGIN_SUCCESS).';



COMMENT ON COLUMN "public"."audit_logs"."table_name" IS 'A tabela que foi afetada pela ação.';



COMMENT ON COLUMN "public"."audit_logs"."record_id" IS 'O ID do registro que foi afetado.';



COMMENT ON COLUMN "public"."audit_logs"."old_record" IS 'O estado do registro antes da mudança (para UPDATEs e DELETEs).';



COMMENT ON COLUMN "public"."audit_logs"."new_record" IS 'O estado do registro depois da mudança (para INSERTs e UPDATEs).';



CREATE SEQUENCE IF NOT EXISTS "public"."audit_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."audit_logs_id_seq" OWNED BY "public"."audit_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."feedback_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "report_type" "text" NOT NULL,
    "subject" "text",
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'PENDENTE'::"text" NOT NULL,
    CONSTRAINT "check_report_type" CHECK (("report_type" = ANY (ARRAY['feedback'::"text", 'bug'::"text", 'suggestion'::"text"])))
);


ALTER TABLE "public"."feedback_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "can_manage_relatos" boolean DEFAULT false,
    "can_view_users" boolean DEFAULT false,
    "can_create_users" boolean DEFAULT false,
    "can_delete_users" boolean DEFAULT false,
    "can_view_feedbacks" boolean DEFAULT false,
    "can_delete_relatos" boolean DEFAULT false,
    "can_manage_users" boolean DEFAULT false,
    "can_delete_any_comment" boolean DEFAULT false,
    "can_view_all_relatos" boolean DEFAULT false NOT NULL,
    "can_view_audit_logs" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."can_view_audit_logs" IS 'Permite que o usuário visualize a página de logs de auditoria.';



CREATE TABLE IF NOT EXISTS "public"."relato_comentarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "relato_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."relato_comentarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relato_logs" (
    "id" bigint NOT NULL,
    "relato_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "action_type" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."relato_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."relato_logs" IS 'Registra o histórico de eventos e alterações para cada relato.';



COMMENT ON COLUMN "public"."relato_logs"."relato_id" IS 'Referência ao relato que sofreu a alteração.';



COMMENT ON COLUMN "public"."relato_logs"."user_id" IS 'Usuário que realizou a ação. Pode ser nulo se a ação for do sistema.';



COMMENT ON COLUMN "public"."relato_logs"."action_type" IS 'Tipo de ação realizada (ex: CREATE, UPDATE, COMMENT).';



COMMENT ON COLUMN "public"."relato_logs"."details" IS 'Objeto JSON com os dados iniciais do relato ou os detalhes da alteração (campo, valor antigo, valor novo).';



ALTER TABLE "public"."relato_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."relato_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."relato_responsaveis" (
    "relato_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."relato_responsaveis" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."relato_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."relato_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relatos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid",
    "is_anonymous" boolean DEFAULT false,
    "local_ocorrencia" "text" NOT NULL,
    "data_ocorrencia" "date" NOT NULL,
    "hora_aproximada_ocorrencia" time without time zone,
    "descricao" "text" NOT NULL,
    "riscos_identificados" "text" NOT NULL,
    "danos_ocorridos" "text",
    "status" "text" DEFAULT 'PENDENTE'::"text" NOT NULL,
    "planejamento_cronologia_solucao" "text",
    "data_conclusao_solucao" "date",
    "relato_code" "text",
    "tipo_relato" "text",
    "concluido_sem_data" boolean DEFAULT false
);


ALTER TABLE "public"."relatos" OWNER TO "postgres";


COMMENT ON COLUMN "public"."relatos"."planejamento_cronologia_solucao" IS 'Detalhes do planejamento e cronologia da solução do relato.';



COMMENT ON COLUMN "public"."relatos"."data_conclusao_solucao" IS 'Data de conclusão da solução do relato.';



CREATE OR REPLACE VIEW "public"."relatos_with_responsibles_view" WITH ("security_invoker"='on') AS
 SELECT "id",
    "created_at",
    "user_id",
    "is_anonymous",
    "local_ocorrencia",
    "data_ocorrencia",
    "hora_aproximada_ocorrencia",
    "descricao",
    "riscos_identificados",
    "danos_ocorridos",
    "status",
    "planejamento_cronologia_solucao",
    "data_conclusao_solucao",
    "relato_code",
    ( SELECT "json_agg"("json_build_object"('id', "p"."id", 'full_name', "p"."full_name", 'email', "p"."email")) AS "json_agg"
           FROM ("public"."relato_responsaveis" "rr"
             JOIN "public"."profiles" "p" ON (("rr"."user_id" = "p"."id")))
          WHERE ("rr"."relato_id" = "r"."id")) AS "responsibles_details"
   FROM "public"."relatos" "r";


ALTER VIEW "public"."relatos_with_responsibles_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tmp_relato_tipo" (
    "id" "uuid" NOT NULL,
    "tipo_relato" "text"
);


ALTER TABLE "public"."tmp_relato_tipo" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."audit_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback_reports"
    ADD CONSTRAINT "feedback_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relato_comentarios"
    ADD CONSTRAINT "relato_comentarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relato_logs"
    ADD CONSTRAINT "relato_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relato_responsaveis"
    ADD CONSTRAINT "relato_responsaveis_pkey" PRIMARY KEY ("relato_id", "user_id");



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_relato_code_key" UNIQUE ("relato_code");



ALTER TABLE ONLY "public"."tmp_relato_tipo"
    ADD CONSTRAINT "tmp_relato_tipo_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at");



CREATE INDEX "idx_audit_logs_table_record" ON "public"."audit_logs" USING "btree" ("table_name", "record_id");



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "relatos_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."relatos" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit"();



COMMENT ON TRIGGER "relatos_audit_trigger" ON "public"."relatos" IS 'Gatilho que chama a função log_audit() para registrar todas as alterações na tabela de relatos.';



CREATE OR REPLACE TRIGGER "set_relato_code" BEFORE INSERT ON "public"."relatos" FOR EACH ROW EXECUTE FUNCTION "public"."generate_relato_code"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."feedback_reports"
    ADD CONSTRAINT "feedback_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relato_comentarios"
    ADD CONSTRAINT "relato_comentarios_relato_id_fkey" FOREIGN KEY ("relato_id") REFERENCES "public"."relatos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relato_comentarios"
    ADD CONSTRAINT "relato_comentarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."relato_logs"
    ADD CONSTRAINT "relato_logs_relato_id_fkey" FOREIGN KEY ("relato_id") REFERENCES "public"."relatos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relato_logs"
    ADD CONSTRAINT "relato_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."relato_responsaveis"
    ADD CONSTRAINT "relato_responsaveis_relato_id_fkey" FOREIGN KEY ("relato_id") REFERENCES "public"."relatos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relato_responsaveis"
    ADD CONSTRAINT "relato_responsaveis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can manage relato responsibles" ON "public"."relato_responsaveis" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."can_manage_relatos" = true)))));



CREATE POLICY "Allow all authenticated users to view all profiles (fixed)" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow all users to insert relatos" ON "public"."relatos" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anon select (but returns no rows)" ON "public"."relatos" FOR SELECT TO "anon" USING (false);



CREATE POLICY "Allow anonymous inserts" ON "public"."relatos" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert comments" ON "public"."relato_comentarios" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_comentarios"."relato_id")))));



CREATE POLICY "Allow authenticated users to insert feedback reports" ON "public"."feedback_reports" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read all relato responsibles" ON "public"."relato_responsaveis" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read comments for accessible relat" ON "public"."relato_comentarios" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_comentarios"."relato_id"))));



CREATE POLICY "Allow authorized users to read audit logs" ON "public"."audit_logs" FOR SELECT USING (("public"."can_i_view_audit_logs"() = true));



CREATE POLICY "Allow individual access for authenticated users" ON "public"."relatos" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Allow update for managers or assigned responsibles" ON "public"."relatos" FOR UPDATE USING ((( SELECT "profiles"."can_manage_relatos"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."relato_responsaveis" "rr"
  WHERE (("rr"."relato_id" = "relatos"."id") AND ("rr"."user_id" = "auth"."uid"())))))) WITH CHECK ((( SELECT "profiles"."can_manage_relatos"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) OR (EXISTS ( SELECT 1
   FROM "public"."relato_responsaveis" "rr"
  WHERE (("rr"."relato_id" = "relatos"."id") AND ("rr"."user_id" = "auth"."uid"()))))));



COMMENT ON POLICY "Allow update for managers or assigned responsibles" ON "public"."relatos" IS 'Allows users to update a report if they have the can_manage_relatos permission or if they are listed as a responsible party for that specific report.';



CREATE POLICY "Allow users to create relato_logs based on authentication statu" ON "public"."relato_logs" FOR INSERT WITH CHECK (((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())) OR (("auth"."uid"() IS NULL) AND ("user_id" IS NULL))));



CREATE POLICY "Allow users to delete their own comments or if they can delete " ON "public"."relato_comentarios" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."can_delete_any_comment" = true))))));



CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to update their own comments" ON "public"."relato_comentarios" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users with can_delete_relatos permission to delete relato" ON "public"."relatos" FOR DELETE USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."can_delete_relatos" = true))));



CREATE POLICY "Allow users with can_view_feedbacks to update report status" ON "public"."feedback_reports" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."can_view_feedbacks" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."can_view_feedbacks" = true)))));



CREATE POLICY "Allow users with can_view_feedbacks to view all reports" ON "public"."feedback_reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."can_view_feedbacks" = true)))));



CREATE POLICY "Enable select for users based on permissions" ON "public"."relatos" FOR SELECT USING (((( SELECT "profiles"."can_view_all_relatos"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = true) OR ("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."relato_responsaveis"
  WHERE (("relato_responsaveis"."relato_id" = "relatos"."id") AND ("relato_responsaveis"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Usuários autenticados podem criar logs" ON "public"."relato_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários podem ver logs de relatos que eles acessam" ON "public"."relato_logs" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_logs"."relato_id")))));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedback_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_by_deleter" ON "public"."profiles" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."can_delete_users" = true)))) AND ("auth"."uid"() <> "id") AND ("can_manage_users" = false)));



CREATE POLICY "profiles_insert_by_creator" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."can_create_users" = true)))) AND ("can_manage_users" = false)));



CREATE POLICY "profiles_update_roles_by_manager" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."can_manage_users" = true)))) AND ("auth"."uid"() <> "id"))) WITH CHECK ((("email" = "email") AND ("full_name" = "full_name") AND ("created_at" = "created_at") AND ("can_manage_users" = "can_manage_users")));



ALTER TABLE "public"."relato_comentarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relato_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relato_responsaveis" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."relato_comentarios";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";
GRANT USAGE ON SCHEMA "public" TO "anon_relator";














































































































































































GRANT ALL ON FUNCTION "public"."can_i_view_audit_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_i_view_audit_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_i_view_audit_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_record_sem_acidentes"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_record_sem_acidentes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_record_sem_acidentes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_or_update_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_or_update_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_or_update_profile"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user_or_update_profile"() TO "authenticator";



GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."invalidate_user_sessions_on_profile_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."invalidate_user_sessions_on_profile_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invalidate_user_sessions_on_profile_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean, "p_page_number" integer, "p_page_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean, "p_page_number" integer, "p_page_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text", "p_only_mine" boolean, "p_page_number" integer, "p_page_size" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_relato_responsaveis"("p_relato_id" "uuid", "p_user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_relato_responsaveis"("p_relato_id" "uuid", "p_user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_relato_responsaveis"("p_relato_id" "uuid", "p_user_ids" "uuid"[]) TO "service_role";
























GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."feedback_reports" TO "anon";
GRANT ALL ON TABLE "public"."feedback_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_reports" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."relato_comentarios" TO "anon";
GRANT ALL ON TABLE "public"."relato_comentarios" TO "authenticated";
GRANT ALL ON TABLE "public"."relato_comentarios" TO "service_role";



GRANT ALL ON TABLE "public"."relato_logs" TO "anon";
GRANT ALL ON TABLE "public"."relato_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."relato_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."relato_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."relato_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."relato_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."relato_responsaveis" TO "anon";
GRANT ALL ON TABLE "public"."relato_responsaveis" TO "authenticated";
GRANT ALL ON TABLE "public"."relato_responsaveis" TO "service_role";



GRANT ALL ON SEQUENCE "public"."relato_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."relato_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."relato_seq" TO "service_role";



GRANT ALL ON TABLE "public"."relatos" TO "anon";
GRANT ALL ON TABLE "public"."relatos" TO "authenticated";
GRANT ALL ON TABLE "public"."relatos" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."relatos" TO "anon_relator";



GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "anon";
GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "service_role";



GRANT ALL ON TABLE "public"."tmp_relato_tipo" TO "anon";
GRANT ALL ON TABLE "public"."tmp_relato_tipo" TO "authenticated";
GRANT ALL ON TABLE "public"."tmp_relato_tipo" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
