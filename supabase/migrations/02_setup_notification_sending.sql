
-- Migration para ATUALIZAR o gatilho e APAGAR a função antiga de notificação

-- 1. Apagar a função antiga, que não será mais usada no banco de dados.
DROP FUNCTION IF EXISTS public.send_push_notification(jsonb, jsonb);

-- 2. Atualizar a função do gatilho para apenas inserir na fila.
CREATE OR REPLACE FUNCTION public.handle_new_responsavel_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se não houver um responsável, não faz nada.
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insere a tarefa de notificação na fila
  INSERT INTO public.notification_queue(recipient_user_id, notification_type, payload)
  VALUES (NEW.user_id, 'NEW_ASSIGNMENT', jsonb_build_object('relato_id', NEW.relato_id));

  RETURN NEW;
END;
$$;

-- O gatilho em si continua o mesmo, mas agora chama a função simplificada.
-- Nenhuma alteração necessária no CREATE TRIGGER.

