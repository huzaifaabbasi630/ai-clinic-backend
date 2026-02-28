const http = require('http');
const { spawn } = require('child_process');

async function testPatients() {
  console.log('Testing Patient Endpoints...');
  
  console.log('Testing Patient Endpoints against running server...');
  
  const registerData = JSON.stringify({
    name: "Doctor Test",
    email: `doc${Date.now()}@example.com`,
    password: "password123",
    role: "doctor"
  });

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
    // 1. Register User to get Token
    const regRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(registerData) }
    }, registerData);
    
    if (!regRes.data.token) {
      console.log('Registration response:', regRes);
      throw new Error("Could not get token");
    }
    const token = regRes.data.token;
    console.log('Token received for testing.');

    // 2. Create Patient
    console.log('\n--- 1. Create Patient ---');
    const patientData = JSON.stringify({
      name: "John Doe",
      age: 45,
      gender: "Male",
      contact: "1234567890"
    });
    
    const createRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/patients', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(patientData), 'Authorization': `Bearer ${token}` }
    }, patientData);
    
    console.log('Status:', createRes.statusCode);
    console.log('Response:', createRes.data);
    const patientId = createRes.data.data._id;

    // 3. Get All Patients (Pagination)
    console.log('\n--- 2. Get All Patients ---');
    const getAllRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/patients?page=1&limit=5', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status:', getAllRes.statusCode);
    console.log('Count:', getAllRes.data.count, 'Pagination:', getAllRes.data.pagination);

    // 4. Update Patient
    console.log('\n--- 3. Update Patient ---');
    const updateData = JSON.stringify({ age: 46 });
    const updateRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/patients/${patientId}`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(updateData), 'Authorization': `Bearer ${token}` }
    }, updateData);
    console.log('Status:', updateRes.statusCode);
    console.log('Response Age:', updateRes.data.data.age);

    // 5. Delete Patient
    console.log('\n--- 4. Delete Patient ---');
    const delRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/patients/${patientId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status:', delRes.statusCode);
    console.log('Response:', delRes.data);

  } catch (err) {
    console.error('Request failed:', err);
  } finally {
    console.log('\nTests finished.');
  }
}

testPatients();
