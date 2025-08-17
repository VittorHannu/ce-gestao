
-- supabase/migrations/02_setup_notification_sending.sql

-- 1. Habilitar a extensão pg_net para requisições de rede
create extension if not exists pg_net with schema extensions;

-- 2. Criar a função que envia a notificação push
create or replace function public.send_push_notification(subscription jsonb, payload_data jsonb)
returns void
language plpgsql
as $$
declare
  -- ATENÇÃO: Os nomes dos segredos DEVEM ser exatamente estes.
  vapid_private_key text;
  vapid_contact_email text;
  endpoint text;
  auth_key text;
  p256dh_key text;
  jwt_header text;
  jwt_payload text;
  jwt_signature text;
  jwt text;
  ttl integer;
  urgency text;
  topic text;
  auth_header text;
  crypto_key_header text;
  encryption_header text;
  request_id bigint;
begin
  -- Obter os segredos do Vault do Supabase
  select decrypted_secret into vapid_private_key from vault.decrypted_secrets where name = 'VAPID_PRIVATE_KEY';
  select decrypted_secret into vapid_contact_email from vault.decrypted_secrets where name = 'VAPID_CONTACT_EMAIL';

  if vapid_private_key is null or vapid_contact_email is null then
    raise exception 'VAPID secrets not found in Vault. Please configure VAPID_PRIVATE_KEY and VAPID_CONTACT_EMAIL secrets in your Supabase project settings.';
  end if;

  -- Extrair detalhes da inscrição
  endpoint := subscription->>'endpoint';
  auth_key := subscription->'keys'->>'auth';
  p256dh_key := subscription->'keys'->>'p256dh';

  -- Construir o JWT (JSON Web Token) para autenticação VAPID
  jwt_header := '{"typ":"JWT","alg":"ES256"}';
  jwt_payload := json_build_object(
    'aud', split_part(endpoint, '/', 3),
    'exp', extract(epoch from now())::integer + 43200, -- 12 horas de validade
    'sub', vapid_contact_email
  )::text;

  select sign(
    (extensions.url_encode(extensions.base64url_encode(jwt_header)) || '.' || extensions.url_encode(extensions.base64url_encode(jwt_payload)))::bytea,
    vapid_private_key::bytea,
    'sha256'
  ) into jwt_signature;

  jwt := extensions.url_encode(extensions.base64url_encode(jwt_header)) || '.' || extensions.url_encode(extensions.base64url_encode(jwt_payload)) || '.' || extensions.url_encode(extensions.base64url_encode(jwt_signature));

  -- Definir cabeçalhos da requisição
  ttl := 604800; -- 1 semana
  urgency := 'normal';
  topic := 'new-relato'; -- Exemplo de tópico

  auth_header := 'WebPush ' || jwt;
  crypto_key_header := 'dh=' || p256dh_key || ';p256ecdsa=' || extensions.url_encode(vapid_private_key); -- A chave pública é derivada da privada no padrão ES256
  encryption_header := 'salt=' || extensions.url_encode(random_bytes(16));

  -- Enviar a requisição HTTP para o serviço de push
  select net.http_post(
    url:=endpoint,
    headers:=jsonb_build_object(
      'Authorization', auth_header,
      'Content-Type', 'application/octet-stream',
      'Content-Encoding', 'aes128gcm',
      'TTL', ttl,
      'Urgency', urgency,
      'Topic', topic,
      'Encryption', encryption_header,
      'Crypto-Key', crypto_key_header
    ),
    body:=payload_data::text::bytea
  ) into request_id;

end;
$$;


-- 3. Criar a função de gatilho (trigger) que será chamada
create or replace function public.handle_new_relato_notification()
returns trigger
language plpgsql
as $$
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

-- 4. Criar o gatilho na tabela de relatos
-- ATENÇÃO: O gatilho será criado na tabela 'relatos'. Se o nome da sua tabela for diferente, ajuste abaixo.
drop trigger if exists on_new_relato_send_notification on public.relatos;
create trigger on_new_relato_send_notification
  after insert on public.relatos
  for each row
  execute function public.handle_new_relato_notification();

comment on trigger on_new_relato_send_notification on public.relatos is 'When a new report is created, send a push notification to the assigned user.';

