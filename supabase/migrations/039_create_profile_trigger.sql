
-- Trigger function to create/update public.profiles from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_or_update_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user already exists in public.profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- If user exists, update their full_name and email
    UPDATE public.profiles
    SET
      full_name = NEW.raw_user_meta_data->>'full_name',
      email = NEW.email
    WHERE id = NEW.id;
  ELSE
    -- If user does not exist, insert a new record
    INSERT INTO public.profiles (id, full_name, email, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks, can_delete_relatos, can_manage_users)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      TRUE, -- Default is_active to true
      FALSE, -- Default can_manage_relatos to false
      FALSE, -- Default can_view_users to false
      FALSE, -- Default can_create_users to false
      FALSE, -- Default can_delete_users to false
      FALSE, -- Default can_view_feedbacks to false
      FALSE, -- Default can_delete_relatos to false
      FALSE  -- Default can_manage_users to false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid conflicts during re-creation
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_or_updated
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_or_update_profile();

-- Set ownership for the trigger function
ALTER FUNCTION public.handle_new_user_or_update_profile() OWNER TO postgres;

-- Grant usage on the function to the authenticator role
GRANT EXECUTE ON FUNCTION public.handle_new_user_or_update_profile() TO authenticator;
