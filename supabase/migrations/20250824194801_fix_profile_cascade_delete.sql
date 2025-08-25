-- Phase 2: Fix Data Integrity Bug
-- Adds ON DELETE CASCADE to the foreign key constraint on the profiles table.
-- This ensures that when a user is deleted from auth.users, their corresponding profile is also deleted.

-- Step 1: Drop the existing foreign key constraint.
ALTER TABLE "public"."profiles"
DROP CONSTRAINT IF EXISTS "profiles_id_fkey";

-- Step 2: Add the foreign key constraint back with ON DELETE CASCADE.
ALTER TABLE "public"."profiles"
ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES "auth"."users"(id) ON DELETE CASCADE;
