const axios = require('axios');
const DiagnosisLog = require('../models/DiagnosisLog');

exports.analyzeSymptoms = async (symptoms, userId) => {
  let aiData;
  let successStatus = true;

  try {
    // Attempting to use OpenAI API or a mock if environment variable lacks a key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("API Key not found, using fallback simulated response");
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a highly intelligent medical assistant. Analyze these symptoms and provide a logical step-by-step evaluation." },
        { role: "user", content: `Symptoms: ${symptoms}` }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000 // Ensure we never hang the server for too long
    });

    aiData = {
      analysis: response.data.choices[0].message.content,
      source: "openai"
    };

  } catch (error) {
    console.warn("AI API Fallback Triggered:", error.message);
    successStatus = false;
    
    // Graceful Fallback mapping mock AI logic
    aiData = {
      analysis: "Based on your described symptoms, please consult a healthcare professional. Ensure to rest and stay hydrated. (Simulated AI Response - API Unavailable)",
      source: "fallback",
      error: error.message
    };
  }

  // Always log the request and response
  const log = await DiagnosisLog.create({
    userId,
    queryType: 'symptom-check',
    requestData: { symptoms },
    aiResponse: aiData,
    success: successStatus
  });

  return { log, successStatus, aiData };
};

exports.explainPrescription = async (prescriptionId, userId) => {
  let aiData;
  let successStatus = true;

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("API Key not found, using fallback simulated response");
    }

    // Ideally, we'd fetch the prescription from DB and inject its details,
    // but simulating passing the structure direct to AI
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional pharmacist. Explain this prescription plan in simple, easy-to-understand terms for a patient." },
        { role: "user", content: `Please explain this prescription details/ID: ${prescriptionId}` }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });

    aiData = {
      explanation: response.data.choices[0].message.content,
      source: "openai"
    };

  } catch (error) {
    console.warn("AI API Fallback Triggered:", error.message);
    successStatus = false;
    
    // Graceful fallback
    aiData = {
      explanation: "This script generally consists of taking your standard daily medicine after meals. Please read the label instructions locally. (Simulated AI Response - API Unavailable)",
      source: "fallback",
      error: error.message
    };
  }

  const log = await DiagnosisLog.create({
    userId,
    queryType: 'prescription-explain',
    requestData: { prescriptionId },
    aiResponse: aiData,
    success: successStatus
  });

  return { log, successStatus, aiData };
};
