-- Phase 1: Cleanup of unused and redundant database objects.
-- Correction: Swapped order of trigger/function drops to resolve dependency.

-- 1. Drop unused test ENUM type
DROP TYPE IF EXISTS "public"."CEFGRFG";

-- 2. Drop redundant trigger function for updating timestamps
--    Reason: An identical function "set_updated_at_timestamp" already exists.
DROP FUNCTION IF EXISTS "public"."update_updated_at_column"();

-- 3. Drop redundant user creation function (REMOVED FROM MIGRATION)
--    Reason: This function is actively used by the on_auth_user_created trigger in production.
-- DROP FUNCTION IF EXISTS "public"."handle_new_user"();

-- 4. Drop obsolete admin promotion function
--    Reason: It targets a non-existent "is_admin" column. Permissions are now granular.
DROP FUNCTION IF EXISTS "public"."promote_user_to_admin"(user_email text);

-- 5. Drop disabled trigger for daily report limit FIRST
--    Reason: This trigger depends on the function below, so it must be removed first.
DROP TRIGGER IF EXISTS "enforce_daily_relato_limit" ON "public"."relatos";

-- 6. Drop unused daily report limit function
--    Reason: The trigger that called this function is now removed.
DROP FUNCTION IF EXISTS "public"."check_daily_relato_limit"();