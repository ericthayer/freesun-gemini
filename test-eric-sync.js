import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncEricThayerEmail() {
  console.log('🔍 Finding Eric Thayer...');

  const { data: eric, error: findError } = await supabase
    .from('crew_members')
    .select('id, name, email, user_id')
    .eq('name', 'Eric Thayer')
    .is('deleted_at', null)
    .maybeSingle();

  if (findError || !eric) {
    console.error('❌ Error finding Eric Thayer:', findError);
    return;
  }

  console.log('✅ Found Eric Thayer:');
  console.log(`   ID: ${eric.id}`);
  console.log(`   Email (crew_members): ${eric.email}`);
  console.log(`   User ID: ${eric.user_id}`);

  console.log('\n🔍 Checking current auth email...');

  const { data: authUser } = await supabase.auth.admin.getUserById(eric.user_id);

  if (authUser.user) {
    console.log(`   Email (auth.users): ${authUser.user.email}`);
  }

  if (authUser.user?.email === eric.email) {
    console.log('\n✅ Emails already match! No sync needed.');
    return;
  }

  console.log('\n🔄 Syncing email to auth.users...');

  const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
    eric.user_id,
    {
      email: eric.email,
      email_confirm: true
    }
  );

  if (updateError) {
    console.error('❌ Error updating auth email:', updateError);
    return;
  }

  console.log('✅ Successfully synced email!');
  console.log(`   Old: ${authUser.user?.email}`);
  console.log(`   New: ${eric.email}`);

  console.log('\n📝 Updating sync status in crew_members...');

  const { error: statusError } = await supabase
    .from('crew_members')
    .update({
      auth_sync_status: 'synced',
      last_auth_sync: new Date().toISOString()
    })
    .eq('id', eric.id);

  if (statusError) {
    console.error('⚠️ Warning: Could not update sync status:', statusError);
  } else {
    console.log('✅ Sync status updated');
  }

  console.log('\n🎉 Eric Thayer email sync complete!');
  console.log('   He can now reset his password using: eric.thayer594@gmail.com');
}

syncEricThayerEmail()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
