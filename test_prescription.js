const http = require('http');
const fs = require('fs');
const path = require('path');

async function testPrescriptions() {
  console.log('Testing Prescription Endpoints against running server...\n');

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

  const downloadPDF = (options, outputPath) => {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);
      const req = http.request(options, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(res.statusCode));
        });
      });
      req.on('error', (err) => {
        fs.unlink(outputPath, () => reject(err));
      });
      req.end();
    });
  };

  try {
    // 1. Create a Doctor to authorize prescription creation
    const docData = JSON.stringify({ name: "Dr. Roberts", email: `doctor${Date.now()}@example.com`, password: "password123", role: "doctor" });
    const docRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(docData) } }, docData);
    const docToken = docRes.data.token;
    console.log('Registered Doctor, ID:', docRes.data._id);

    // 2. Create Patient to apply prescription
    const patData = JSON.stringify({ name: "Testing Patient", age: 50, gender: "Other", contact: "9998887776" });
    const patRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/patients', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(patData), 'Authorization': `Bearer ${docToken}` } }, patData);
    const patId = patRes.data.data._id;
    console.log('Registered Patient, ID:', patId);

    // 3. Create Prescription
    console.log('\n--- 1. Create Prescription ---');
    const rxData = JSON.stringify({
      patientId: patId,
      medicines: [
        { name: "Paracetamol", dosage: "500mg twice a day" },
        { name: "Amoxicillin", dosage: "250mg thrice a day" }
      ],
      instructions: "Take medicine after meals. Drink plenty of water."
    });
    const rxRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/prescriptions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(rxData), 'Authorization': `Bearer ${docToken}` } }, rxData);
    console.log('Status Create:', rxRes.statusCode);
    const rxId = rxRes.data.data._id;
    console.log('Prescription ID:', rxId);

    // 4. Fetch Patient Prescriptions
    console.log('\n--- 2. Fetch Prescriptions ---');
    const fetchRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/prescriptions/patient/${patId}`, method: 'GET', headers: { 'Authorization': `Bearer ${docToken}` } });
    console.log('Status Fetch:', fetchRes.statusCode);
    console.log('Prescriptions Found:', fetchRes.data.count);

    // 5. Download PDF Stream
    console.log('\n--- 3. Download Prescription PDF ---');
    const pdfPath = path.join(__dirname, `rx_test_${rxId}.pdf`);
    const pdfStatus = await downloadPDF({ hostname: 'localhost', port: 5000, path: `/api/prescriptions/${rxId}/download`, method: 'GET', headers: { 'Authorization': `Bearer ${docToken}` } }, pdfPath);
    console.log('PDF Download Status:', pdfStatus);
    
    // Verify file size
    const stats = fs.statSync(pdfPath);
    console.log(`PDF Saved to ${pdfPath} (Size: ${stats.size} bytes)`);
    
    if (stats.size > 1000) {
      console.log('SUCCESS: Valid PDF streamed and saved locally.');
      // Cleanup
      fs.unlinkSync(pdfPath);
      console.log('Cleaned up test PDF.');
    } else {
      console.log('ERROR: Stream generated a corrupt or empty file.');
    }

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    console.log('\nFinished Tests.');
  }
}

testPrescriptions();
