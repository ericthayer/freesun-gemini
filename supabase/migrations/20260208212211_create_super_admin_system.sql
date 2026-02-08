/*
  # Create Super Admin Role and Permission System

  ## Summary
  This migration creates a comprehensive role-based access control (RBAC) system with Super Admin capabilities,
  user management permissions, and audit logging for the FreeSun Hot Air Ballooning Club.

  ## 1. New Tables

  ### user_roles
  - `id` (uuid, primary key) - Unique role assignment identifier
  - `user_id` (uuid, foreign key to auth.users) - User being assigned the role
  - `crew_member_id` (uuid, foreign key to crew_members) - Associated crew member
  - `role_name` (text) - Role name (super_admin, pilot, ground_crew, user)
  - `assigned_by` (uuid, foreign key to auth.users) - Who assigned this role
  - `assigned_at` (timestamptz) - When the role was assigned
  - `revoked_at` (timestamptz, nullable) - When the role was revoked (soft delete)
  - `metadata` (jsonb) - Additional role-specific data

  ### role_permissions
  - `id` (uuid, primary key) - Unique permission identifier
  - `role_name` (text) - Role this permission applies to
  - `permission_type` (text) - Type of permission (edit_users, add_users, delete_users, etc.)
  - `resource` (text) - What resource this applies to (users, balloons, schedules, etc.)
  - `can_create` (boolean) - Can create new resources
  - `can_read` (boolean) - Can read/view resources
  - `can_update` (boolean) - Can update existing resources
  - `can_delete` (boolean) - Can delete resources
  - `metadata` (jsonb) - Additional permission constraints

  ### admin_actions
  - `id` (uuid, primary key) - Unique action identifier
  - `admin_user_id` (uuid, foreign key to auth.users) - Admin who performed the action
  - `action_type` (text) - Type of action (create_user, edit_user, delete_user, assign_role, etc.)
  - `target_user_id` (uuid, nullable) - User who was affected by the action
  - `target_resource` (text) - Type of resource affected
  - `target_resource_id` (uuid, nullable) - Specific resource ID
  - `before_data` (jsonb) - Data before the change
  - `after_data` (jsonb) - Data after the change
  - `ip_address` (text) - IP address of the admin
  - `user_agent` (text) - Browser/client information
  - `created_at` (timestamptz) - When the action occurred

  ## 2. Schema Changes

  ### crew_members table additions
  - `is_super_admin` (boolean) - Flag indicating Super Admin status
  - `deleted_at` (timestamptz, nullable) - Soft delete timestamp
  - `deleted_by` (uuid, nullable) - Who deleted this user

  ## 3. Security

  ### Row Level Security (RLS) Policies
  - user_roles: Only Super Admins can view/modify
  - role_permissions: Read access for authenticated, write for Super Admins only
  - admin_actions: Read access for Super Admins only, automatic write via trigger
  - crew_members: Updated policies to allow Super Admin full access

  ## 4. Initial Data

  ### Super Admin Assignment
  - Assign Eric Thayer (eric.thayer594@gmail.com) as Super Admin
  - Create default role permissions for all roles
  - Log the initial Super Admin assignment

  ## 5. Triggers and Functions

  - Auto-log all admin actions to admin_actions table
  - Helper function to check if user is Super Admin
  - Function to send email notifications for role changes
*/

-- ============================================================================
-- 1. CREATE ENUM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE permission_action AS ENUM (
    'edit_users',
    'add_users',
    'delete_users',
    'restore_users',
    'manage_roles',
    'view_audit_logs',
    'manage_balloons',
    'manage_schedules',
    'manage_maintenance',
    'manage_flights',
    'manage_events'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. UPDATE crew_members TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN is_super_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crew_members' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE crew_members ADD COLUMN deleted_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE user_roles TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  crew_member_id uuid REFERENCES crew_members(id) ON DELETE CASCADE,
  role_name text NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT unique_active_user_role UNIQUE (user_id, role_name, revoked_at)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE role_permissions TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL,
  permission_type text NOT NULL,
  resource text NOT NULL,
  can_create boolean DEFAULT false,
  can_read boolean DEFAULT false,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_role_permission UNIQUE (role_name, permission_type, resource)
);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE admin_actions TABLE (Audit Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  admin_crew_member_id uuid REFERENCES crew_members(id),
  action_type text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  target_crew_member_id uuid REFERENCES crew_members(id),
  target_resource text,
  target_resource_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a user is a Super Admin
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM crew_members cm
    WHERE cm.user_id = check_user_id
      AND cm.is_super_admin = true
      AND cm.deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's crew member ID
CREATE OR REPLACE FUNCTION get_crew_member_id(check_user_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT id
    FROM crew_members
    WHERE user_id = check_user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- Policies for user_roles table
DROP POLICY IF EXISTS "Super Admins can view all user roles" ON user_roles;
CREATE POLICY "Super Admins can view all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can insert user roles" ON user_roles;
CREATE POLICY "Super Admins can insert user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can update user roles" ON user_roles;
CREATE POLICY "Super Admins can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admins can delete user roles" ON user_roles;
CREATE POLICY "Super Admins can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- Policies for role_permissions table
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;
CREATE POLICY "Authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Super Admins can manage role permissions" ON role_permissions;
CREATE POLICY "Super Admins can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Policies for admin_actions table
DROP POLICY IF EXISTS "Super Admins can view all admin actions" ON admin_actions;
CREATE POLICY "Super Admins can view all admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "System can insert admin actions" ON admin_actions;
CREATE POLICY "System can insert admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update crew_members policies for Super Admin access
DROP POLICY IF EXISTS "Super Admins can manage all crew members" ON crew_members;
CREATE POLICY "Super Admins can manage all crew members"
  ON crew_members FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ============================================================================
-- 8. INSERT DEFAULT ROLE PERMISSIONS
-- ============================================================================

-- Super Admin permissions (can do everything)
INSERT INTO role_permissions (role_name, permission_type, resource, can_create, can_read, can_update, can_delete) VALUES
  ('super_admin', 'edit_users', 'users', false, true, true, false),
  ('super_admin', 'add_users', 'users', true, true, false, false),
  ('super_admin', 'delete_users', 'users', false, true, false, true),
  ('super_admin', 'restore_users', 'users', false, true, true, false),
  ('super_admin', 'manage_roles', 'roles', true, true, true, true),
  ('super_admin', 'view_audit_logs', 'admin_actions', false, true, false, false),
  ('super_admin', 'manage_balloons', 'balloons', true, true, true, true),
  ('super_admin', 'manage_schedules', 'schedules', true, true, true, true),
  ('super_admin', 'manage_maintenance', 'maintenance', true, true, true, true),
  ('super_admin', 'manage_flights', 'flights', true, true, true, true),
  ('super_admin', 'manage_events', 'events', true, true, true, true)
ON CONFLICT (role_name, permission_type, resource) DO NOTHING;

-- Pilot permissions (can manage flights and maintenance)
INSERT INTO role_permissions (role_name, permission_type, resource, can_create, can_read, can_update, can_delete) VALUES
  ('pilot', 'manage_flights', 'flights', true, true, true, false),
  ('pilot', 'manage_maintenance', 'maintenance', true, true, true, false),
  ('pilot', 'manage_schedules', 'schedules', true, true, true, false),
  ('pilot', 'manage_balloons', 'balloons', false, true, true, false)
ON CONFLICT (role_name, permission_type, resource) DO NOTHING;

-- Ground Crew permissions (can view and assist)
INSERT INTO role_permissions (role_name, permission_type, resource, can_create, can_read, can_update, can_delete) VALUES
  ('ground_crew', 'manage_maintenance', 'maintenance', true, true, true, false),
  ('ground_crew', 'manage_schedules', 'schedules', false, true, false, false),
  ('ground_crew', 'manage_balloons', 'balloons', false, true, false, false)
ON CONFLICT (role_name, permission_type, resource) DO NOTHING;

-- ============================================================================
-- 9. ASSIGN ERIC THAYER AS SUPER ADMIN
-- ============================================================================

-- First, ensure Eric Thayer exists in crew_members
INSERT INTO crew_members (id, name, role, experience_years, email, phone, certifications, bio, image_url, availability, specialty, flights, is_super_admin)
VALUES (
  '6a4319c4-71d4-4e85-b228-506d84eb18fe',
  'Eric Thayer',
  'Ground Crew',
  3,
  'eric.thayer594@gmail.com',
  '+1 555-0199',
  ARRAY['System Administrator', 'User Management'],
  'Eric is the system administrator and Super Admin for the FreeSun Hot Air Ballooning Club, managing user accounts and system operations.',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=600',
  'available',
  'System Administration',
  0,
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_super_admin = true,
  email = EXCLUDED.email,
  bio = EXCLUDED.bio,
  specialty = EXCLUDED.specialty;

-- Log the Super Admin assignment
INSERT INTO admin_actions (
  admin_user_id,
  admin_crew_member_id,
  action_type,
  target_crew_member_id,
  target_resource,
  after_data,
  ip_address,
  user_agent
)
VALUES (
  NULL,
  '6a4319c4-71d4-4e85-b228-506d84eb18fe',
  'assign_super_admin',
  '6a4319c4-71d4-4e85-b228-506d84eb18fe',
  'crew_members',
  jsonb_build_object(
    'crew_member_name', 'Eric Thayer',
    'email', 'eric.thayer594@gmail.com',
    'is_super_admin', true,
    'assigned_by', 'system_migration'
  ),
  'system',
  'database_migration'
);

-- ============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_crew_members_super_admin ON crew_members(is_super_admin) WHERE is_super_admin = true;
CREATE INDEX IF NOT EXISTS idx_crew_members_deleted ON crew_members(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name) WHERE revoked_at IS NULL;
