-- Drop the previous function to ensure a clean update.
DROP FUNCTION IF EXISTS public.get_record_sem_acidentes();

-- Re-create the function with the corrected record logic.
CREATE OR REPLACE FUNCTION public.get_record_sem_acidentes()
RETURNS TABLE(dias_atuais_sem_acidentes INTEGER, recorde_dias_sem_acidentes INTEGER, data_ultimo_acidente DATE) AS $$
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
$$ LANGUAGE plpgsql;