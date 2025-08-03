CREATE OR REPLACE FUNCTION check_daily_relato_limit()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_daily_relato_limit
BEFORE INSERT ON public.relatos
FOR EACH ROW
EXECUTE FUNCTION check_daily_relato_limit();
