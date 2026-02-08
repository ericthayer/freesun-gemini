# Eric Thayer Email Sync Status

## Current Status (Retrieved from Database)

**Crew Member Record:**
- **ID:** `6a4319c4-71d4-4e85-b228-506d84eb18fe`
- **Name:** Eric Thayer
- **Email (crew_members):** `eric.thayer594@gmail.com` ✅ (Real email)
- **User ID (auth link):** `972a826e-1a4d-4401-bf73-ee55959facbb`
- **Auth Sync Status:** `pending` ⚠️ (Needs sync)
- **Is Super Admin:** `true`

## What Needs to Happen

Eric's auth.users email needs to be updated from the old placeholder to his real email.

**Expected Change:**
- **From:** `ethayer@freesun.net` (placeholder)
- **To:** `eric.thayer594@gmail.com` (real email)

## How to Execute the Sync

### Option 1: Via Supabase Dashboard (Recommended for Manual Execution)

1. Go to: https://supabase.com/dashboard/project/hvfpiemdlredzgcsxlzx
2. Navigate to **Authentication** → **Users**
3. Find Eric Thayer (User ID: `972a826e-1a4d-4401-bf73-ee55959facbb`)
4. Click on the user
5. Edit the email field to: `eric.thayer594@gmail.com`
6. Check "Confirm Email" checkbox
7. Save

Then update the crew_members table:
```sql
UPDATE crew_members
SET
  auth_sync_status = 'synced',
  last_auth_sync = NOW()
WHERE id = '6a4319c4-71d4-4e85-b228-506d84eb18fe';
```

### Option 2: Via SQL + Manual Dashboard Update

**Step 1:** Verify current state
```sql
-- Check crew_members email
SELECT id, name, email, user_id, auth_sync_status
FROM crew_members
WHERE name = 'Eric Thayer';
```

**Step 2:** Update via Dashboard (see Option 1 steps 1-7)

**Step 3:** Mark as synced
```sql
UPDATE crew_members
SET
  auth_sync_status = 'synced',
  last_auth_sync = NOW(),
  auth_sync_error = NULL
WHERE id = '6a4319c4-71d4-4e85-b228-506d84eb18fe';
```

### Option 3: Via Admin UI (When Eric logs in as Super Admin)

1. Eric logs in at: https://your-app-url.com/login
   - Use current credentials (with old email if still working)

2. Navigate to: `/admin/users`

3. Find his own name in the list

4. Click the **Mail icon** (Sync Email button)

5. Click "Sync Email" in the modal

6. System will automatically:
   - Update auth.users email to `eric.thayer594@gmail.com`
   - Mark as synced in crew_members
   - Create audit log entry

### Option 4: Via cURL (Requires Valid Session Token)

```bash
# First, get Eric's session token by logging in
# Then run:

curl -X POST https://hvfpiemdlredzgcsxlzx.supabase.co/functions/v1/update-crew-emails \
  -H "Authorization: Bearer [ERIC_SESSION_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "crewMemberId": "6a4319c4-71d4-4e85-b228-506d84eb18fe"
  }'
```

## Verification After Sync

Run this SQL to verify:
```sql
SELECT
  cm.name,
  cm.email as crew_email,
  cm.auth_sync_status,
  cm.last_auth_sync
FROM crew_members cm
WHERE cm.id = '6a4319c4-71d4-4e85-b228-506d84eb18fe';
```

Then check in Supabase Dashboard:
- Authentication → Users → Find Eric Thayer
- Verify email shows: `eric.thayer594@gmail.com`

## Test Password Reset

After sync is complete:

1. Go to login page
2. Click "Forgot Password"
3. Enter: `eric.thayer594@gmail.com`
4. Check email inbox for reset link
5. Complete password reset
6. Log in with new password

## Why I Can't Execute Directly

The Edge Function requires:
- A valid Super Admin session token (from logged-in user)
- Authorization header with Bearer token

Since I'm running as a backend process without an active user session, I cannot generate a valid token. The sync must be executed by:
- Eric himself through the UI
- Another Super Admin through the UI
- Direct update via Supabase Dashboard

## Recommended Immediate Action

**Easiest approach:** Update via Supabase Dashboard (Option 1)

1. Takes 30 seconds
2. No coding required
3. Immediate effect
4. Then run the SQL to mark as synced

After this one-time manual fix, all future email changes will:
- Automatically flag as "pending"
- Show in Admin UI with sync button
- Can be batch synced if needed
