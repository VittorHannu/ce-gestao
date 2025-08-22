
-- Function to get a specific claim from the JWT of the currently authenticated user.
-- This is useful for checking custom user permissions stored in the token.
CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claims', true), '')::jsonb->claim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user has a specific permission.
-- It uses get_my_claim to look for a permission and returns true or false.
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  claim_value JSONB;
BEGIN
  claim_value := public.get_my_claim(permission_name);
  IF claim_value IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN claim_value::boolean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_claim(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;
