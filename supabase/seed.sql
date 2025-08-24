-- supabase/seed.sql
-- Mantido apenas para criar dados que não sejam de autenticação, como relatos de exemplo.
-- A criação de usuários agora é controlada pelo script em supabase/seed.ts

-- A lógica de criação de usuários foi removida deste arquivo.
-- Se precisar adicionar dados de teste (que não sejam usuários), adicione aqui.

-- Exemplo de como manter a criação de outros dados:
/*
INSERT INTO public.relatos (user_id, local_ocorrencia, data_ocorrencia, descricao, riscos_identificados, danos_ocorridos, status, tipo_relato)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'user@local.com'), 'Refeitório Principal', '2025-08-20', 'Piso molhado próximo à entrada da cozinha, sem sinalização.', 'Risco de queda (escorregamento).', 'Nenhum dano, situação observada preventivamente.', 'PENDENTE', 'Desvio'),
  ((SELECT id FROM auth.users WHERE email = 'user@local.com'), 'Pátio de Manobras', '2025-08-21', 'Empilhadeira operando com farol dianteiro queimado.', 'Risco de atropelamento ou colisão, especialmente em áreas de baixa visibilidade.', 'Nenhum.', 'APROVADO', 'Ato Inseguro');
*/
