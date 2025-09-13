-- Function to compare two JSONB objects and return the differences.
-- This is the core of the audit log detail view.
CREATE OR REPLACE FUNCTION public.jsonb_diff_val(val1 JSONB, val2 JSONB)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Performs a FULL OUTER JOIN on the keys of both JSON objects
    -- to capture added, deleted, and modified fields in a single pass.
    SELECT jsonb_agg(
        jsonb_build_object(
            'field', COALESCE(k1, k2), -- The name of the field that changed
            'old', val1 -> COALESCE(k1, k2), -- The old value (will be null if field was added)
            'new', val2 -> COALESCE(k1, k2)  -- The new value (will be null if field was deleted)
        )
    )
    INTO result
    FROM jsonb_object_keys(val1) k1
    FULL OUTER JOIN jsonb_object_keys(val2) k2 ON k1 = k2
    -- The WHERE clause filters for keys where the value has actually changed.
    WHERE val1 -> COALESCE(k1, k2) IS DISTINCT FROM val2 -> COALESCE(k1, k2);

    -- Return the result, or an empty JSON array if no differences were found.
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.jsonb_diff_val(JSONB, JSONB) IS 'Compares two JSONB values and returns a JSONB array of objects, each detailing a field that was added, deleted, or changed.';
