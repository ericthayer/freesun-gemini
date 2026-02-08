# Batch Sync Procedure - Fixing Auth Email Mismatch

This document provides step-by-step instructions for synchronizing all user emails between `crew_members` and `auth.users` tables.

## Pre-Sync Checklist

### 1. Verify Current State

Run this SQL query to see which users need syncing:

```sql
-- Check for email mismatches
SELECT
  cm.id as crew_id,
  cm.name,
  cm.email as crew_email,
  cm.user_id,
  cm.auth_sync_status,
  cm.last_auth_sync
FROM crew_members cm
WHERE cm.user_id IS NOT NULL
  AND cm.deleted_at IS NULL
  AND (cm.auth_sync_status = 'pending' OR cm.last_auth_sync IS NULL)
ORDER BY cm.name;
```

### 2. Get Sync Statistics

```sql
-- View sync status counts
SELECT * FROM get_auth_sync_stats();
```

### 3. View Detailed Sync Status

```sql
-- See all users and their sync status
SELECT * FROM crew_auth_sync_status;
```

## Sync Procedures

### Option 1: Dry Run Test (RECOMMENDED FIRST)

Test the sync without making changes:

```bash
curl -X POST https://[YOUR_PROJECT].supabase.co/functions/v1/update-crew-emails \
  -H "Authorization: Bearer [YOUR_SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "batchUpdate": true,
    "dryRun": true
  }'
```

**Response will show:**
- Which emails would be updated
- Old vs new email for each user
- Any errors that would occur
- Summary statistics

### Option 2: Sync Single User

For testing or fixing one user at a time:

```bash
curl -X POST https://[YOUR_PROJECT].supabase.co/functions/v1/update-crew-emails \
  -H "Authorization: Bearer [YOUR_SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "crewMemberId": "[CREW_MEMBER_ID]"
  }'
```

**Example:** Sync Eric Thayer

```bash
curl -X POST https://[YOUR_PROJECT].supabase.co/functions/v1/update-crew-emails \
  -H "Authorization: Bearer [YOUR_SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "crewMemberId": "972a826e-1a4d-4401-bf73-ee55959facbb"
  }'
```

### Option 3: Batch Update All Users (PRODUCTION)

After verifying dry run results:

```bash
curl -X POST https://[YOUR_PROJECT].supabase.co/functions/v1/update-crew-emails \
  -H "Authorization: Bearer [YOUR_SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "batchUpdate": true,
    "dryRun": false
  }'
```

## Post-Sync Verification

### 1. Check Sync Results

```sql
-- View updated sync statuses
SELECT
  name,
  email,
  auth_sync_status,
  last_auth_sync,
  auth_sync_error
FROM crew_members
WHERE user_id IS NOT NULL
  AND deleted_at IS NULL
ORDER BY last_auth_sync DESC NULLS LAST;
```

### 2. Verify Auth Emails Match

Use the Supabase Dashboard:
1. Go to Authentication > Users
2. Compare emails with crew_members table
3. Verify Eric Thayer shows `eric.thayer594@gmail.com`

### 3. Test Password Reset

```bash
curl -X POST https://[YOUR_PROJECT].supabase.co/functions/v1/reset-crew-passwords \
  -H "Authorization: Bearer [YOUR_SUPER_ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "crewMemberId": "[CREW_MEMBER_ID]",
    "sendResetEmail": true
  }'
```

### 4. Check Audit Log

```sql
-- View all sync actions
SELECT
  aa.created_at,
  cm.name as admin_name,
  aa.action_type,
  cm_target.name as target_name,
  aa.before_data->>'email' as old_email,
  aa.after_data->>'email' as new_email
FROM admin_actions aa
LEFT JOIN crew_members cm ON cm.id = aa.admin_crew_member_id
LEFT JOIN crew_members cm_target ON cm_target.id = aa.target_crew_member_id
WHERE aa.action_type = 'sync_auth_email'
ORDER BY aa.created_at DESC
LIMIT 50;
```

## Rollback Procedure

If sync causes issues, you can revert individual users:

### SQL Rollback (Manual)

```sql
-- Find the user's old email from audit log
SELECT
  target_user_id,
  before_data->>'email' as old_email,
  after_data->>'email' as new_email
FROM admin_actions
WHERE action_type = 'sync_auth_email'
  AND target_crew_member_id = '[CREW_MEMBER_ID]'
ORDER BY created_at DESC
LIMIT 1;
```

Then use the Supabase Dashboard or admin API to revert the email.

## Edge Cases & Troubleshooting

### Problem: Duplicate Email Error

**Error:** "User with this email already exists"

**Solution:**
1. Identify which auth user has the email
2. Determine if it's a legitimate duplicate
3. If illegitimate, delete the duplicate auth user first
4. Re-run sync

```sql
-- Find crew members with same email
SELECT id, name, email, user_id
FROM crew_members
WHERE email = '[DUPLICATE_EMAIL]'
  AND deleted_at IS NULL;
```

### Problem: Invalid Email Format

**Error:** "Invalid email format"

**Solution:**
1. Fix email in crew_members table
2. Re-run sync

```sql
-- Find invalid emails
SELECT id, name, email
FROM crew_members
WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND email != ''
  AND deleted_at IS NULL;
```

### Problem: User Not Found in Auth

**Error:** "Auth user not found"

**Solution:**
1. User's auth account was deleted
2. Create new auth account or unlink user_id

```sql
-- Unlink deleted auth accounts
UPDATE crew_members
SET
  user_id = NULL,
  auth_sync_status = 'no_auth_account'
WHERE id = '[CREW_MEMBER_ID]';
```

### Problem: Session Invalidation

**Issue:** Users logged out after email change

**Solution:**
- This is expected behavior for security
- Users can log back in with their NEW email
- Communicate email change to users beforehand

## Communication Template

Send this to users before sync:

```
Subject: Important: Your FreeSun Account Email Update

Hello [Name],

We're updating our system to ensure your account email matches your actual email address.

OLD EMAIL: [old_email]@freesun.net
NEW EMAIL: [actual_email]

What this means for you:
- Use your NEW email to log in from now on
- You may be logged out briefly during the update
- You can now receive password reset emails
- Your account data remains unchanged

If you have any issues logging in after this update, please contact your administrator.

Best regards,
FreeSun Hot Air Ballooning Club
```

## Monitoring & Maintenance

### Daily Check (Automated)

Set up a cron job to check for pending syncs:

```sql
-- Find users with pending syncs older than 1 hour
SELECT
  id,
  name,
  email,
  auth_sync_status,
  updated_at
FROM crew_members
WHERE auth_sync_status = 'pending'
  AND updated_at < NOW() - INTERVAL '1 hour'
  AND deleted_at IS NULL;
```

### Weekly Report

```sql
-- Generate sync health report
SELECT
  auth_sync_status,
  COUNT(*) as count,
  MAX(last_auth_sync) as most_recent_sync,
  MIN(last_auth_sync) as oldest_sync
FROM crew_members
WHERE deleted_at IS NULL
GROUP BY auth_sync_status;
```

## Testing Checklist

Before running in production:

- [ ] Dry run completed successfully
- [ ] Single user sync tested
- [ ] Verified sync status updates in database
- [ ] Checked audit log entries created
- [ ] Tested password reset with new email
- [ ] Confirmed no duplicate email errors
- [ ] User communication prepared
- [ ] Rollback procedure documented
- [ ] Backup of auth.users table created
- [ ] Super Admin permissions verified
