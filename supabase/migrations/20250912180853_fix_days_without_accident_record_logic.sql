-- First, drop the old function to ensure a clean slate.
DROP FUNCTION IF EXISTS public.get_record_sem_acidentes();

-- Re-create the function with the corrected logic.
CREATE OR REPLACE FUNCTION public.get_record_sem_acidentes()
RETURNS TABLE(dias_atuais_sem_acidentes INTEGER, recorde_dias_sem_acidentes INTEGER, data_ultimo_acidente DATE) AS $$
DECLARE
    max_historical_interval INTEGER;
    current_interval INTEGER;
    last_accident_date DATE;
BEGIN
    -- Step 1: Find the date of the last accident.
    -- An "accident" is defined as a 'relato' of type 'ACIDENTE COM DANOS' or 'ACIDENTE SEM DANOS'.
    SELECT MAX(r.data_ocorrencia) INTO last_accident_date
    FROM public.relatos r
    WHERE r.tipo_relato IN ('ACIDENTE COM DANOS', 'ACIDENTE SEM DANOS');

    -- Step 2: Calculate the current streak of days without accidents.
    -- This is the number of days from the last accident until today.
    IF last_accident_date IS NOT NULL THEN
        current_interval := (CURRENT_DATE - last_accident_date);
    ELSE
        -- If there are no accidents recorded at all, the current streak is calculated
        -- from the date of the very first 'relato' of any kind.
        SELECT (CURRENT_DATE - MIN(r.created_at)::date) INTO current_interval
        FROM public.relatos r;
    END IF;

    -- Step 3: Calculate the historical record for the longest period without an accident.
    -- This is done by calculating the difference in days between consecutive accidents.
    WITH accident_dates AS (
        SELECT r.data_ocorrencia AS accident_date
        FROM public.relatos r
        WHERE r.tipo_relato IN ('ACIDENTE COM DANOS', 'ACIDENTE SEM DANOS')
        ORDER BY r.data_ocorrencia
    ),
    intervals AS (
        SELECT
            -- Calculate the difference from the previous accident date.
            accident_date - lag(accident_date, 1) OVER (ORDER BY accident_date) AS interval_days
        FROM accident_dates
    )
    -- The record is the maximum of these calculated intervals.
    SELECT MAX(iv.interval_days) INTO max_historical_interval
    FROM intervals iv;

    -- Step 4: Define the return values.
    -- The current streak.
    dias_atuais_sem_acidentes := COALESCE(current_interval, 0);
    
    -- The historical record. This is the key fix: we no longer compare it with the current streak.
    -- If no historical interval exists (e.g., only one accident recorded), the record is the current streak itself.
    recorde_dias_sem_acidentes := COALESCE(max_historical_interval, dias_atuais_sem_acidentes, 0);

    -- The date of the last accident.
    data_ultimo_acidente := last_accident_date;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
