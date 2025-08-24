-- supabase/seed.sql
-- v6: Gerando o ID do usuário explicitamente para evitar erro de NULL.

DO $$
DECLARE
  admin_user_id uuid;
  regular_user_id uuid;
  new_admin_uuid uuid := gen_random_uuid(); -- Gerar UUID explicitamente
  new_regular_uuid uuid := gen_random_uuid(); -- Gerar UUID explicitamente
BEGIN
  -- 1. Criar Usuário Admin
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, created_at, updated_at)
  VALUES (new_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@local.com', crypt('123456', gen_salt('bf')), '{"provider":"email","providers":["email"]}', NOW(), NOW())
  RETURNING id INTO admin_user_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), admin_user_id, admin_user_id, format('{"sub":"%s","email":"%s"}', admin_user_id, 'admin@local.com')::jsonb, 'email', NOW(), NOW(), NOW());

  UPDATE public.profiles SET full_name = 'Administrador Local', is_active = true, can_manage_relatos = true, can_view_users = true, can_create_users = true, can_delete_users = true, can_view_feedbacks = true, can_delete_relatos = true, can_manage_users = true, can_delete_any_comment = true, can_view_all_relatos = true
  WHERE id = admin_user_id;

  -- 2. Criar Usuário Padrão
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, created_at, updated_at)
  VALUES (new_regular_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user@local.com', crypt('123456', gen_salt('bf')), '{"provider":"email","providers":["email"]}', NOW(), NOW())
  RETURNING id INTO regular_user_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), regular_user_id, regular_user_id, format('{"sub":"%s","email":"%s"}', regular_user_id, 'user@local.com')::jsonb, 'email', NOW(), NOW(), NOW());

  UPDATE public.profiles SET full_name = 'Usuário Padrão Local', is_active = true
  WHERE id = regular_user_id;

  -- 3. Criar Relatos de Exemplo
  INSERT INTO public.relatos (user_id, local_ocorrencia, data_ocorrencia, descricao, riscos_identificados, danos_ocorridos, status, tipo_relato)
  VALUES
    (regular_user_id, 'Refeitório Principal', '2025-08-20', 'Piso molhado próximo à entrada da cozinha, sem sinalização.', 'Risco de queda (escorregamento).', 'Nenhum dano, situação observada preventivamente.', 'PENDENTE', 'Desvio'),
    (regular_user_id, 'Pátio de Manobras', '2025-08-21', 'Empilhadeira operando com farol dianteiro queimado.', 'Risco de atropelamento ou colisão, especialmente em áreas de baixa visibilidade.', 'Nenhum.', 'APROVADO', 'Ato Inseguro');

END $$;