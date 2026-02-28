let http = require('http');

async function testAppointments() {
  console.log('Testing Appointment Endpoints against running server...');
  
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
    // 1. Create Doctor User
    const docData = JSON.stringify({ name: "Dr. Smith", email: `doc${Date.now()}@example.com`, password: "password123", role: "doctor" });
    const docRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(docData) } }, docData);
    const docToken = docRes.data.token;
    const docId = docRes.data._id;
    console.log('Doctor Created:', docId);

    // 2. Create Receptionist User
    const recData = JSON.stringify({ name: "Rec. Alice", email: `rec${Date.now()}@example.com`, password: "password123", role: "receptionist" });
    const recRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(recData) } }, recData);
    const recToken = recRes.data.token;
    console.log('Receptionist Created.');

    // 3. Create Patient (as Receptionist)
    const patData = JSON.stringify({ name: "Jane Doe", age: 30, gender: "Female", contact: "0987654321" });
    const patRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/patients', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(patData), 'Authorization': `Bearer ${recToken}` } }, patData);
    const patId = patRes.data.data._id;
    console.log('Patient Created:', patId);

    // 4. Book Appointment (as Receptionist)
    console.log('\n--- 1. Book Appointment ---');
    const apptDate = new Date();
    apptDate.setDate(apptDate.getDate() + 1); // tomorrow
    const apptData = JSON.stringify({ patientId: patId, doctorId: docId, date: apptDate.toISOString(), notes: "Regular Checkup" });
    const apptRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/appointments', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(apptData), 'Authorization': `Bearer ${recToken}` } }, apptData);
    console.log('Status Book:', apptRes.statusCode);
    const apptId = apptRes.data.data._id;
    console.log('Appointment ID:', apptId);

    // 5. Doctor views appointments
    console.log('\n--- 2. Doctor Queries Appointments ---');
    const docGetRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/appointments', method: 'GET', headers: { 'Authorization': `Bearer ${docToken}` } });
    console.log('Status Doctor Query:', docGetRes.statusCode);
    console.log('Appointments Count for Doctor:', docGetRes.data.count);

    // 6. Doctor updates status to Confirmed
    console.log('\n--- 3. Doctor Confirms Appointment ---');
    const statusData = JSON.stringify({ status: "confirmed" });
    const updateRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/appointments/${apptId}/status`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(statusData), 'Authorization': `Bearer ${docToken}` } }, statusData);
    console.log('Status Update:', updateRes.statusCode);
    console.log('New Status:', updateRes.data.data.status);

    // 7. Receptionist Cancels Appointment
    console.log('\n--- 4. Receptionist Cancels Appointment ---');
    const cancelRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/appointments/${apptId}`, method: 'DELETE', headers: { 'Authorization': `Bearer ${recToken}` } });
    console.log('Cancel Status:', cancelRes.statusCode);
    console.log('Cancel Message:', cancelRes.data.message);

    // 8. Filter by query
    console.log('\n--- 5. Test Filters ---');
    const filterQuery = `/api/appointments?doctorId=${docId}&status=cancelled`;
    const filterRes = await makeRequest({ hostname: 'localhost', port: 5000, path: filterQuery, method: 'GET', headers: { 'Authorization': `Bearer ${recToken}` } });
    console.log('Filter Query Status:', filterRes.statusCode);
    console.log('Filtered Count:', filterRes.data.count);

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    console.log('\nFinished Tests.');
  }
}

testAppointments();
