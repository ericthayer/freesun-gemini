/*
  # Add Auth Sync Tracking to crew_members

  ## Summary
  This migration adds tracking columns to monitor the synchronization status between
  crew_members table and auth.users table, helping prevent email mismatch issues.

  ## 1. New Columns

  ### crew_members table additions
  - `last_auth_sync` (timestamptz, nullable) - When auth.users was last synced
  - `auth_sync_status` (text) - Current sync status (synced, pending, error)
  - `auth_sync_error` (text, nullable) - Last sync error message if any

  ## 2. Functions

  ### trigger_auth_sync()
  - Automatically called when crew_members email is updated
  - Marks record as needing sync by setting auth_sync_status to 'pending'

  ## 3. Triggers

  ### trigger_crew_email_update
  - Fires AFTER UPDATE on crew_members when email changes
  - Invokes trigger_auth_sync() function

  ## 4. Indexes

  - Index on auth_sync_status for filtering pending syncs
  - Index on last_auth_sync for finding stale records

  ## 5. Initial Data Update

  - Mark all existing records with user_id as needing verification
  - Set initial sync status based on current state
*/

-- ============================================================================
-- 1. ADD SYNC TRACKING COLUMNS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'last_auth_sync'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN last_auth_sync timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'auth_sync_status'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN auth_sync_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'auth_sync_error'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN auth_sync_error text;
  END IF;
END $$;

-- ============================================================================
-- 2. CREATE TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auth_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email) THEN
    NEW.auth_sync_status := 'pending';
    NEW.auth_sync_error := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. CREATE TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_crew_email_update ON crew_members;

CREATE TRIGGER trigger_crew_email_update
  BEFORE UPDATE ON crew_members
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auth_sync();

-- ============================================================================
-- 4. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_crew_members_auth_sync_status 
  ON crew_members(auth_sync_status) 
  WHERE auth_sync_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_crew_members_last_auth_sync 
  ON crew_members(last_auth_sync) 
  WHERE last_auth_sync IS NOT NULL;

-- ============================================================================
-- 5. INITIALIZE SYNC STATUS FOR EXISTING RECORDS
-- ============================================================================

UPDATE crew_members
SET 
  auth_sync_status = CASE
    WHEN user_id IS NULL THEN 'no_auth_account'
    WHEN email = '' OR email IS NULL THEN 'no_email'
    ELSE 'pending'
  END,
  last_auth_sync = NULL,
  auth_sync_error = NULL
WHERE auth_sync_status IS NULL OR auth_sync_status = 'pending';

-- ============================================================================
-- 6. CREATE HELPER FUNCTION TO GET SYNC STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_auth_sync_stats()
RETURNS TABLE (
  status text,
  count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(auth_sync_status, 'unknown') as status,
    COUNT(*) as count
  FROM crew_members
  WHERE deleted_at IS NULL
  GROUP BY auth_sync_status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CREATE VIEW FOR SYNC MONITORING
-- ============================================================================

CREATE OR REPLACE VIEW crew_auth_sync_status AS
SELECT 
  cm.id,
  cm.name,
  cm.email as crew_email,
  cm.user_id,
  cm.auth_sync_status,
  cm.last_auth_sync,
  cm.auth_sync_error,
  CASE 
    WHEN cm.last_auth_sync IS NULL THEN 'Never synced'
    WHEN cm.last_auth_sync < NOW() - INTERVAL '30 days' THEN 'Stale (>30 days)'
    WHEN cm.last_auth_sync < NOW() - INTERVAL '7 days' THEN 'Old (>7 days)'
    ELSE 'Recent'
  END as sync_age,
  cm.created_at,
  cm.deleted_at
FROM crew_members cm
WHERE cm.deleted_at IS NULL
ORDER BY 
  CASE cm.auth_sync_status
    WHEN 'error' THEN 1
    WHEN 'pending' THEN 2
    WHEN 'synced' THEN 3
    ELSE 4
  END,
  cm.last_auth_sync ASC NULLS FIRST;

-- Grant access to authenticated users to view sync status
GRANT SELECT ON crew_auth_sync_status TO authenticated;
