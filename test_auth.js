const http = require('http');
const { spawn } = require('child_process');

async function testAuth() {
  console.log('Testing Authentication Endpoints...');
  
  const server = spawn('node', ['server.js']);
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const registerData = JSON.stringify({
    name: "Test Admin",
    email: `admin${Date.now()}@example.com`,
    password: "password123",
    role: "admin"
  });

  const registerOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': registerData.length
    }
  };

  const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: responseData ? JSON.parse(responseData) : {}, headers: res.headers });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: responseData, headers: res.headers });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  };

  try {
    console.log('\n1. Testing Register...');
    const regRes = await makeRequest(registerOptions, registerData);
    console.log('Status:', regRes.statusCode);
    console.log('Response:', regRes.data);
    
    // Test login
    console.log('\n2. Testing Login...');
    const loginData = JSON.stringify({
      email: JSON.parse(registerData).email,
      password: "password123"
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };
    
    const logRes = await makeRequest(loginOptions, loginData);
    console.log('Status:', logRes.statusCode);
    console.log('Response:', logRes.data);
    
    const cookies = logRes.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      console.log('\n3. Testing Get Me (Protected Route via Secure Cookie)...');
      const meOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Cookie': cookies[0].split(';')[0]
        }
      };
      const meRes = await makeRequest(meOptions);
      console.log('Status:', meRes.statusCode);
      console.log('Response:', meRes.data);
    } else {
      console.log('\n3. Error: No token cookie was set on login!');
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  } finally {
    server.kill();
    console.log('\nTests finished, server stopped.');
  }
}

testAuth();
