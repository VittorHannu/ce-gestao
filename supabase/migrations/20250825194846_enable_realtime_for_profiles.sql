-- Habilita o broadcast de alterações na tabela de perfis para o serviço de Realtime.
-- Isso é necessário para que a funcionalidade de "presença online" funcione, 
-- já que o serviço precisa que pelo menos uma tabela esteja habilitada para 
-- processar corretamente as conexões de presença.

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
