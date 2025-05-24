// Test script for admin-get-submissions-with-users function
// Run with: node src/test-admin-submissions.js

async function testAdminSubmissions() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yqnikgupiaghgjtsaypr.supabase.co';
  
  console.log('Signing in to get access token...');
  
  // You should use your own admin email/password for testing
  const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.VITE_SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: 'parkergawne10@gmail.com',
      password: 'your-password-here' // Replace with your actual password
    })
  });
  
  if (!loginResponse.ok) {
    const errorData = await loginResponse.json();
    console.error('Login failed:', errorData);
    return;
  }
  
  const authData = await loginResponse.json();
  const accessToken = authData.access_token;
  
  console.log('Authenticated successfully');
  
  console.log('Calling admin-get-submissions-with-users function...');
  
  const functionResponse = await fetch(
    `${supabaseUrl}/functions/v1/admin-get-submissions-with-users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  if (!functionResponse.ok) {
    try {
      const errorData = await functionResponse.json();
      console.error('Function call failed:', errorData);
    } catch (e) {
      console.error('Function call failed with status:', functionResponse.status);
    }
    return;
  }
  
  const submissions = await functionResponse.json();
  console.log(`Successfully fetched ${submissions.length} submissions`);
  
  // Print the first submission as a sample
  if (submissions.length > 0) {
    console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
  }
}

testAdminSubmissions().catch(err => {
  console.error('Test failed with error:', err);
}); 