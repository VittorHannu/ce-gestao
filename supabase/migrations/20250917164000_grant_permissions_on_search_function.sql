
-- Grant execute permissions on the function to the anon and authenticated roles
-- This was likely lost when the function was replaced.
GRANT EXECUTE ON FUNCTION public.search_relatos_unaccented(text, text, text, date, date, text, boolean, integer, integer, uuid) 
TO anon, authenticated;
