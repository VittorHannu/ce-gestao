

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






CREATE TYPE "public"."CEFGRFG" AS ENUM (
    'GJF',
    'DGHGDX'
);


ALTER TYPE "public"."CEFGRFG" OWNER TO "postgres";


COMMENT ON TYPE "public"."CEFGRFG" IS 'FGSFG';



CREATE TYPE "public"."approval_status" AS ENUM (
    'pendente',
    'aprovado',
    'reprovado'
);


ALTER TYPE "public"."approval_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_daily_relato_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    relatos_count INTEGER;
BEGIN
    SELECT count(*)
    INTO relatos_count
    FROM public.relatos
    WHERE user_id = NEW.user_id
      AND created_at >= (now() - interval '24 hours');

    IF relatos_count >= 8 THEN
        RAISE EXCEPTION 'Limite de 8 relatos por dia excedido.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_daily_relato_limit"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."enqueue_in_app_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.in_app_notifications (user_id, type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$$;


ALTER FUNCTION "public"."enqueue_in_app_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.notification_queue (recipient_user_id, notification_type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$$;


ALTER FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") OWNER TO "postgres";


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
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'totalAprovados', COUNT(*) FILTER (WHERE status = 'APROVADO'),
        'concluidos', COUNT(*) FILTER (WHERE status = 'APROVADO' AND data_conclusao_solucao IS NOT NULL),
        'emAndamento', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NOT NULL AND data_conclusao_solucao IS NULL),
        'semTratativa', COUNT(*) FILTER (WHERE status = 'APROVADO' AND planejamento_cronologia_solucao IS NULL AND data_conclusao_solucao IS NULL),
        'pendenteAprovacao', COUNT(*) FILTER (WHERE status = 'PENDENTE')
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


CREATE OR REPLACE FUNCTION "public"."handle_new_relato_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  subscription_record record;
  assigned_user_id uuid;
  payload jsonb;
begin
  -- ID do usuário para quem o relato foi atribuído
  assigned_user_id := NEW.responsavel_id;

  -- Montar o payload (dados da notificação)
  payload := jsonb_build_object(
    'title', 'Novo Relato Atribuído!',
    'body', 'Um novo relato (' || NEW.id::text || ') foi atribuído a você.',
    'icon', '/favicon.ico', -- Caminho para o ícone
    'data', jsonb_build_object(
      'url', '/relatos/' || NEW.id::text -- URL para abrir ao clicar
    )
  );

  -- Buscar todas as inscrições do usuário atribuído e enviar a notificação
  for subscription_record in
    select subscription_data from public.push_subscriptions where user_id = assigned_user_id
  loop
    perform public.send_push_notification(subscription_record.subscription_data, payload);
  end loop;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."handle_new_relato_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_responsavel_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  subscription_record record;
  payload jsonb;
  relato_code_text text;
begin
  if NEW.user_id is null then
    return NEW;
  end if;

  select relato_code into relato_code_text from public.relatos where id = NEW.relato_id;

  payload := jsonb_build_object(
    'title', 'Novo Relato Atribuído!',
    'body', 'O relato ' || coalesce(relato_code_text, NEW.relato_id::text) || ' foi atribuído a você.',
    'icon', '/favicon.ico',
    'data', jsonb_build_object(
      'url', '/relatos/' || NEW.relato_id::text
    )
  );

  for subscription_record in
    select subscription_data from public.push_subscriptions where user_id = NEW.user_id
  loop
    perform public.send_push_notification(subscription_record.subscription_data, payload);
  end loop;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."handle_new_responsavel_notification"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."promote_user_to_admin"("user_email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true 
  WHERE email = user_email;
END;
$$;


ALTER FUNCTION "public"."promote_user_to_admin"("user_email" "text") OWNER TO "postgres";


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

    final_query := final_query || ' ORDER BY r.created_at DESC';

    RETURN QUERY EXECUTE final_query;
END;
$$;


ALTER FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_push_notification"("subscription" "jsonb", "payload_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  vapid_private_key text;
  vapid_contact_email text;
  endpoint text;
  jwt text;
  request_id bigint;
begin
  select decrypted_secret into vapid_private_key from vault.decrypted_secrets where name = 'VAPID_PRIVATE_KEY';
  select decrypted_secret into vapid_contact_email from vault.decrypted_secrets where name = 'VAPID_CONTACT_EMAIL';

  if vapid_private_key is null or vapid_contact_email is null then
    RAISE LOG '[send_push_notification] ERROR: VAPID secrets not found.';
    return;
  end if;

  endpoint := subscription->>'endpoint';

  jwt := extensions.sign(
    (select row_to_json(r) from (select '{"typ":"JWT","alg":"ES256"}' as header, json_build_object(
      'aud', split_part(endpoint, '/', 3),
      'exp', extract(epoch from now())::integer + 43200,
      'sub', vapid_contact_email
    ) as payload) r)::text::bytea,
    vapid_private_key
  );

  select net.http_post(
    url:=endpoint,
    headers:=jsonb_build_object(
      'Authorization', 'WebPush ' || jwt,
      'Content-Encoding', 'aes128gcm'
    ),
    body:=payload_data::text::bytea
  ) into request_id;

exception
  when others then
    RAISE LOG '[send_push_notification] An exception occurred: %', SQLERRM;
end;
$$;


ALTER FUNCTION "public"."send_push_notification"("subscription" "jsonb", "payload_data" "jsonb") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."trg_new_relato_comment_func"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    relato_owner_id UUID;
    responsible_user_id UUID;
    commenter_id UUID;
    notification_payload JSONB;
BEGIN
    -- Get the ID of the user who made the comment
    commenter_id := NEW.user_id;

    -- Get the owner of the relato
    SELECT user_id INTO relato_owner_id FROM public.relatos WHERE id = NEW.relato_id;

    -- Prepare the common notification payload
    notification_payload := jsonb_build_object(
        'relato_id', NEW.relato_id,
        'comment_id', NEW.id,
        'commenter_id', NEW.user_id,
        'comment_text', NEW.comment_text
    );

    -- Enqueue push notification and in-app notification for the relato owner, if they are not the commenter
    IF relato_owner_id IS NOT NULL AND relato_owner_id != commenter_id THEN
        PERFORM public.enqueue_notification(
            relato_owner_id,
            'NEW_COMMENT',
            notification_payload
        );
        PERFORM public.enqueue_in_app_notification(
            relato_owner_id,
            'NEW_COMMENT',
            notification_payload
        );
    END IF;

    -- Enqueue push notification and in-app notification for responsible users, if they are not the commenter or the relato owner
    FOR responsible_user_id IN
        SELECT user_id FROM public.relato_responsaveis WHERE relato_id = NEW.relato_id
    LOOP
        IF responsible_user_id IS NOT NULL AND responsible_user_id != commenter_id AND responsible_user_id != relato_owner_id THEN
            PERFORM public.enqueue_notification(
                responsible_user_id,
                'NEW_COMMENT',
                notification_payload
            );
            PERFORM public.enqueue_in_app_notification(
                responsible_user_id,
                'NEW_COMMENT',
                notification_payload
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_new_relato_comment_func"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_relato_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Se tem data de conclusão, marca como concluído
    IF NEW.data_conclusao_solucao IS NOT NULL THEN
        NEW.status = 'concluido';
    -- Se não tem data de conclusão mas tinha antes, volta para em_andamento
    ELSIF OLD.data_conclusao_solucao IS NOT NULL AND NEW.data_conclusao_solucao IS NULL THEN
        NEW.status = 'em_andamento';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_relato_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


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


CREATE TABLE IF NOT EXISTS "public"."in_app_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."in_app_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_queue" (
    "id" bigint NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "payload" "jsonb",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "last_attempt_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "error_message" "text"
);


ALTER TABLE "public"."notification_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."notification_queue" IS 'Fila de notificações a serem processadas e enviadas aos usuários.';



ALTER TABLE "public"."notification_queue" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notification_queue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



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
    "notification_preferences" "jsonb" DEFAULT '{"general_updates": true, "new_report_assigned": true, "new_comment_on_report": true, "report_status_changed": true}'::"jsonb",
    "can_view_all_relatos" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."notification_preferences" IS 'User preferences for receiving different types of notifications.';



CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."push_subscriptions" IS 'Stores push notification subscription data for each user device.';



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
    "tipo_relato" "text"
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


ALTER TABLE ONLY "public"."feedback_reports"
    ADD CONSTRAINT "feedback_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."in_app_notifications"
    ADD CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_queue"
    ADD CONSTRAINT "notification_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "unique_subscription" UNIQUE ("user_id", "subscription_data");



CREATE OR REPLACE TRIGGER "enforce_daily_relato_limit" BEFORE INSERT ON "public"."relatos" FOR EACH ROW EXECUTE FUNCTION "public"."check_daily_relato_limit"();

ALTER TABLE "public"."relatos" DISABLE TRIGGER "enforce_daily_relato_limit";



CREATE OR REPLACE TRIGGER "on_new_responsavel_send_notification" AFTER INSERT ON "public"."relato_responsaveis" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_responsavel_notification"();



COMMENT ON TRIGGER "on_new_responsavel_send_notification" ON "public"."relato_responsaveis" IS 'Quando um responsável é adicionado a um relato, envia uma notificação push para ele.';



CREATE OR REPLACE TRIGGER "set_relato_code" BEFORE INSERT ON "public"."relatos" FOR EACH ROW EXECUTE FUNCTION "public"."generate_relato_code"();



CREATE OR REPLACE TRIGGER "trg_new_relato_comment" AFTER INSERT ON "public"."relato_comentarios" FOR EACH ROW EXECUTE FUNCTION "public"."trg_new_relato_comment_func"();



ALTER TABLE ONLY "public"."feedback_reports"
    ADD CONSTRAINT "feedback_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."in_app_notifications"
    ADD CONSTRAINT "in_app_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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



CREATE POLICY "Allow authenticated users to insert comments" ON "public"."relato_comentarios" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_comentarios"."relato_id")))));



CREATE POLICY "Allow authenticated users to insert feedback reports" ON "public"."feedback_reports" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read all relato responsibles" ON "public"."relato_responsaveis" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read comments for accessible relat" ON "public"."relato_comentarios" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_comentarios"."relato_id"))));



CREATE POLICY "Allow full access to service role" ON "public"."notification_queue" USING (true) WITH CHECK (true);



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



CREATE POLICY "Allow users to manage their own push subscriptions" ON "public"."push_subscriptions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



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



CREATE POLICY "Users can delete their own in-app notifications" ON "public"."in_app_notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own in-app notifications" ON "public"."in_app_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own in-app notifications" ON "public"."in_app_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários autenticados podem criar logs" ON "public"."relato_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Usuários podem ver logs de relatos que eles acessam" ON "public"."relato_logs" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."relatos"
  WHERE ("relatos"."id" = "relato_logs"."relato_id")))));



ALTER TABLE "public"."feedback_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."in_app_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_queue" ENABLE ROW LEVEL SECURITY;


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



ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relato_comentarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relato_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relato_responsaveis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relatos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."relato_comentarios";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";
GRANT USAGE ON SCHEMA "public" TO "anon_relator";














































































































































































GRANT ALL ON FUNCTION "public"."check_daily_relato_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_daily_relato_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_daily_relato_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_relato_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_relatos_admin_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_in_app_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_in_app_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_in_app_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_notification_type" "text", "p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_relato_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"("p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_relatos_count_by_type"("p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_relato_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_relato_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_relato_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_responsavel_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_responsavel_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_responsavel_notification"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."promote_user_to_admin"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."promote_user_to_admin"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."promote_user_to_admin"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_relatos_unaccented"("p_search_term" "text", "p_status_filter" "text", "p_responsible_filter" "text", "p_start_date" "date", "p_end_date" "date", "p_tipo_relato_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_push_notification"("subscription" "jsonb", "payload_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."send_push_notification"("subscription" "jsonb", "payload_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_push_notification"("subscription" "jsonb", "payload_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_email_to_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_new_relato_comment_func"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_new_relato_comment_func"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_new_relato_comment_func"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."update_relato_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_relato_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_relato_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."feedback_reports" TO "anon";
GRANT ALL ON TABLE "public"."feedback_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback_reports" TO "service_role";



GRANT ALL ON TABLE "public"."in_app_notifications" TO "anon";
GRANT ALL ON TABLE "public"."in_app_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."in_app_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."notification_queue" TO "anon";
GRANT ALL ON TABLE "public"."notification_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_queue" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_queue_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



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
GRANT INSERT ON TABLE "public"."relatos" TO PUBLIC;
GRANT SELECT,INSERT ON TABLE "public"."relatos" TO "anon_relator";



GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "anon";
GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."relatos_with_responsibles_view" TO "service_role";









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
