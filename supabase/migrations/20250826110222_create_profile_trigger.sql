-- Drop the trigger if it exists, for idempotency.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to execute the handle_new_user function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();