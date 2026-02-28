const http = require('http');

async function testAdmin() {
  console.log('Testing Admin Dashboard Endpoints against running server...\n');

  const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(responseData || '{}') }));
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  };

  try {
    // 1. Create User (Admin)
    const adminData = JSON.stringify({ name: "Mr. Admin", email: `adminboss${Date.now()}@example.com`, password: "password123", role: "admin" });
    const adminRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(adminData) } }, adminData);
    const adminToken = adminRes.data.token;
    console.log('Registered Admin Boss, ID:', adminRes.data._id);

    // 2. Fetch Dashboard
    console.log('\n--- Fetching Dashboard Stats ---');
    const dbRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } });
    console.log('Status Dashboard:', dbRes.statusCode);
    console.log('Dashboard Data:', JSON.stringify(dbRes.data, null, 2));

    // 3. Test Unauthorized Access (Doctor trying to access Admin Dashboard)
    const docData = JSON.stringify({ name: "Dr. AccessTest", email: `draccess${Date.now()}@example.com`, password: "password123", role: "doctor" });
    const docRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(docData) } }, docData);
    const docToken = docRes.data.token;
    
    console.log('\n--- Testing Role Access Constraints ---');
    const docDbRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/admin/dashboard', method: 'GET', headers: { 'Authorization': `Bearer ${docToken}` } });
    console.log('Doctor Accessing Admin Dashboard Status:', docDbRes.statusCode); // Expect 403
    console.log('Doctor Accessing Admin Dashboard Message:', docDbRes.data.message);

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    console.log('\nFinished Tests.');
  }
}

testAdmin();
