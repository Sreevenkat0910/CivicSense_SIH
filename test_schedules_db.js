const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './Server/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);

async function testSchedulesDatabase() {
  console.log('🔍 Testing Schedules Database Connection...\n');
  
  try {
    // Test 1: Check if schedules table exists and get count
    console.log('1. Checking schedules table...');
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('*')
      .limit(5);
    
    if (schedulesError) {
      console.error('❌ Error fetching schedules:', schedulesError.message);
      return;
    }
    
    console.log(`✅ Found ${schedules.length} schedules in database`);
    console.log('📋 Sample schedules:');
    schedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. ${schedule.title} (${schedule.start_time} - ${schedule.end_time})`);
    });
    
    // Test 2: Check users table
    console.log('\n2. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`✅ Found ${users.length} users in database`);
    console.log('👥 Sample users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.user_id}) - ${user.email}`);
    });
    
    // Test 3: Try to create a test schedule
    console.log('\n3. Testing schedule creation...');
    const testSchedule = {
      user_id: users[0]?.user_id || 'test-user',
      title: 'Test Schedule from Script',
      description: 'This is a test schedule created by the database test script',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
      location: 'Test Location',
      is_recurring: false
    };
    
    const { data: newSchedule, error: createError } = await supabase
      .from('schedules')
      .insert(testSchedule)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating test schedule:', createError.message);
    } else {
      console.log('✅ Successfully created test schedule:', newSchedule.title);
      
      // Clean up - delete the test schedule
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', newSchedule.id);
      
      if (deleteError) {
        console.error('⚠️  Warning: Could not delete test schedule:', deleteError.message);
      } else {
        console.log('✅ Test schedule cleaned up successfully');
      }
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('✅ Your schedules will now use real database data.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testSchedulesDatabase();
