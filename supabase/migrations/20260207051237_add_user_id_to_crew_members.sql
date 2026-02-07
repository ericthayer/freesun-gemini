/*
  # Add user_id to crew_members and fill missing emails

  1. Modified Tables
    - `crew_members`
      - Added `user_id` (uuid, nullable) - Links to auth.users for authentication
      - Updated empty emails for 5 crew members (Tom, Linda, James, Sofia, Marcus)

  2. Important Notes
    - user_id is nullable initially; will be populated after auth users are created
    - Emails follow the pattern firstname@freesun.net
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN user_id uuid;
  END IF;
END $$;

UPDATE crew_members SET email = 'tom@freesun.net' WHERE name = 'Tom Wilson' AND email = '';
UPDATE crew_members SET email = 'linda@freesun.net' WHERE name = 'Linda Gao' AND email = '';
UPDATE crew_members SET email = 'james@freesun.net' WHERE name = 'James Peterson' AND email = '';
UPDATE crew_members SET email = 'sofia@freesun.net' WHERE name = 'Sofia Rossi' AND email = '';
UPDATE crew_members SET email = 'marcus@freesun.net' WHERE name = 'Marcus Wright' AND email = '';
