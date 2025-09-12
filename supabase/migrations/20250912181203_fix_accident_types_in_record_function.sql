-- Drop the previous function to ensure a clean update.
DROP FUNCTION IF EXISTS public.get_record_sem_acidentes();

-- Re-create the function with the corrected accident types.
CREATE OR REPLACE FUNCTION public.get_record_sem_acidentes()
RETURNS TABLE(dias_atuais_sem_acidentes INTEGER, recorde_dias_sem_acidentes INTEGER, data_ultimo_acidente DATE) AS $$
DECLARE
    max_historical_interval INTEGER;
    current_interval INTEGER;
    last_accident_date DATE;
BEGIN
    -- Step 1: Find the date of the last accident using the CORRECT types.
    SELECT MAX(r.data_ocorrencia) INTO last_accident_date
    FROM public.relatos r
    WHERE r.tipo_relato IN ('Acidente com afastamento', 'Fatal', 'Severo');

    -- Step 2: Calculate the current streak of days without accidents.
    IF last_accident_date IS NOT NULL THEN
        current_interval := (CURRENT_DATE - last_accident_date);
    ELSE
        -- Fallback if no accidents are recorded.
        SELECT (CURRENT_DATE - MIN(r.created_at)::date) INTO current_interval
        FROM public.relatos r;
    END IF;

    -- Step 3: Calculate the historical record using the CORRECT accident types.
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

    -- Step 4: Define the return values.
    dias_atuais_sem_acidentes := COALESCE(current_interval, 0);
    recorde_dias_sem_acidentes := COALESCE(max_historical_interval, dias_atuais_sem_acidentes, 0);
    data_ultimo_acidente := last_accident_date;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
