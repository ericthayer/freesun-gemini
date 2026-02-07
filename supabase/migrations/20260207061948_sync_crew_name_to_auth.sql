/*
  # Sync crew_members.name to auth.users metadata
  
  1. New Functions
    - `sync_crew_name_to_auth()` - Trigger function that updates auth.users.raw_user_meta_data
      when crew_members.name changes
  
  2. New Triggers
    - `trigger_sync_crew_name_to_auth` - Fires after UPDATE on crew_members table
  
  3. How it works
    - When a crew member's name is updated, the trigger automatically updates their
      auth.users.raw_user_meta_data to include the new name
    - This keeps authentication metadata in sync with crew member profiles
    - Only fires when name actually changes (not on every update)
  
  4. Important Notes
    - Only updates if user_id is not null
    - Merges with existing metadata (preserves other fields)
    - Runs automatically - no manual function calls needed
*/

-- Create function to sync crew member name to auth.users metadata
CREATE OR REPLACE FUNCTION sync_crew_name_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if user_id exists and name has changed
  IF NEW.user_id IS NOT NULL AND (OLD.name IS DISTINCT FROM NEW.name) THEN
    -- Update the auth.users raw_user_meta_data with the new name
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('name', NEW.name)
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after crew_members UPDATE
DROP TRIGGER IF EXISTS trigger_sync_crew_name_to_auth ON crew_members;
CREATE TRIGGER trigger_sync_crew_name_to_auth
  AFTER UPDATE ON crew_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_crew_name_to_auth();
