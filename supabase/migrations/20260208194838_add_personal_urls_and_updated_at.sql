/*
  # Add Personal URLs and Updated At columns

  1. Modified Tables
    - `crew_members`
      - `personal_urls` (jsonb): Array of {label, url} objects for personal links
      - `updated_at` (timestamptz): Auto-updated timestamp for cache invalidation

  2. Important Notes
    - personal_urls defaults to empty JSON array
    - updated_at auto-sets on every row modification via trigger
    - No data loss - additive changes only
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'personal_urls'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN personal_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_crew_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trg_crew_members_updated_at'
  ) THEN
    CREATE TRIGGER trg_crew_members_updated_at
      BEFORE UPDATE ON crew_members
      FOR EACH ROW
      EXECUTE FUNCTION update_crew_members_updated_at();
  END IF;
END $$;
