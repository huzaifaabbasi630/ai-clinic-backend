const http = require('http');

async function testAI() {
  console.log('Testing AI Endpoints against running server...\n');

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
    // 1. Create User to authenticate
    const userData = JSON.stringify({ name: "Alice AI User", email: `ai${Date.now()}@example.com`, password: "password123", role: "receptionist" });
    const userRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(userData) } }, userData);
    const token = userRes.data.token;
    console.log('Registered User ID:', userRes.data._id);

    // 2. Test Symptom Analysis (Expect Graceful Fallback if OPENAI_API_KEY does not exist)
    console.log('\n--- 1. Testing Symptom Check ---\n');
    const symptomData = JSON.stringify({ symptoms: "I have a headache and mild fever since yesterday." });
    const symRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/ai/symptom-check', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(symptomData), 'Authorization': `Bearer ${token}` } }, symptomData);
    
    console.log('Status Symptom Check:', symRes.statusCode);
    if (symRes.data && symRes.data.data) {
        console.log('Log Saved ID:', symRes.data.data.logId);
        console.log('Is Fallback?:', symRes.data.data.isFallback);
        console.log('AI Response:', symRes.data.data.response);
    } else {
        console.log("Raw failure response:", symRes.data);
    }

    // 3. Test Prescription Explain
    console.log('\n--- 2. Testing Prescription Explain ---\n');
    const explainData = JSON.stringify({ prescriptionId: "DEMO-RX-123456" });
    const explainRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/ai/prescription-explain', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(explainData), 'Authorization': `Bearer ${token}` } }, explainData);

    console.log('Status Explain:', explainRes.statusCode);
    if (explainRes.data && explainRes.data.data) {
        console.log('Log Saved ID:', explainRes.data.data.logId);
        console.log('Is Fallback?:', explainRes.data.data.isFallback);
        console.log('AI Response:', explainRes.data.data.response);
    } else {
        console.log("Raw failure response:", explainRes.data);
    }

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    console.log('\nFinished Tests.');
  }
}

testAI();
