// Test script for admin-api function
// Run with: node src/test-admin-api.js
// Make sure to replace the SUPABASE_URL and SUPABASE_ANON_KEY with your actual values

async function testAdminApi() {
  // Configure these variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yqnikgupiaghgjtsaypr.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';
  const adminEmail = 'parkergawne10@gmail.com';
  const adminPassword = 'YOUR_PASSWORD_HERE'; // Replace with actual admin password
  
  console.log('Testing admin-api function');
  console.log('-------------------------');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  // Step 1: Sign in as admin
  console.log('\n1. Signing in as admin...');
  
  const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword
    })
  });
  
  if (!loginResponse.ok) {
    try {
      const errorData = await loginResponse.json();
      console.error('Login failed:', errorData);
    } catch (e) {
      console.error('Login failed with status:', loginResponse.status);
    }
    return;
  }
  
  const authData = await loginResponse.json();
  const accessToken = authData.access_token;
  
  console.log('✅ Authenticated successfully');
  
  // Step 2: Test get-submissions route
  console.log('\n2. Testing get-submissions route...');
  
  try {
    const submissionsResponse = await fetch(
      `${supabaseUrl}/functions/v1/admin-api/get-submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!submissionsResponse.ok) {
      const errorData = await submissionsResponse.json();
      console.error('Failed to get submissions:', errorData);
      return;
    }
    
    const submissions = await submissionsResponse.json();
    console.log(`✅ Successfully fetched ${submissions.length} submissions`);
    
    if (submissions.length > 0) {
      console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
    }
  } catch (error) {
    console.error('Error testing get-submissions:', error);
  }
  
  // Step 3: Test get-users route
  console.log('\n3. Testing get-users route...');
  
  try {
    const usersResponse = await fetch(
      `${supabaseUrl}/functions/v1/admin-api/get-users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!usersResponse.ok) {
      const errorData = await usersResponse.json();
      console.error('Failed to get users:', errorData);
      return;
    }
    
    const users = await usersResponse.json();
    console.log(`✅ Successfully fetched ${users.length} users`);
    
    if (users.length > 0) {
      // Print a sanitized version (no sensitive data)
      const sampleUser = users[0];
      const sanitizedUser = {
        id: sampleUser.id,
        full_name: sampleUser.full_name,
        email: sampleUser.email ? sampleUser.email.substring(0, 3) + '***' : null,
        role: sampleUser.role,
        is_paid: sampleUser.is_paid,
      };
      
      console.log('Sample user:', JSON.stringify(sanitizedUser, null, 2));
    }
  } catch (error) {
    console.error('Error testing get-users:', error);
  }
  
  // Step 4: Test get-stats route
  console.log('\n4. Testing get-stats route...');
  
  try {
    const statsResponse = await fetch(
      `${supabaseUrl}/functions/v1/admin-api/get-stats`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!statsResponse.ok) {
      // Check if it's a 404 (we may not have created the RPC functions for stats yet)
      if (statsResponse.status === 404) {
        console.log('⚠️ get-stats route not implemented yet (expected 404)');
      } else {
        const errorData = await statsResponse.json();
        console.error('Failed to get stats:', errorData);
      }
      return;
    }
    
    const stats = await statsResponse.json();
    console.log('✅ Successfully fetched stats:', JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error testing get-stats:', error);
  }
  
  console.log('\n-------------------------');
  console.log('✅ All tests completed');
}

testAdminApi().catch(err => {
  console.error('Test failed with error:', err);
}); 