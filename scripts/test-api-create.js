// Script to test the API endpoint for creating questions
require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCreateQuestion() {
  try {
    const testQuestion = {
      id: `API-TEST-${Date.now()}`,
      text: "API Test question created at " + new Date().toISOString(),
      type: "text",
      paths: ["New Business"],
      required: false,
      helpText: "This is a test question from API",
      status: "draft",
      order: 1000,
      options: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Sending POST request to create question:', testQuestion);
    
    const response = await fetch('http://localhost:3000/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuestion),
    });
    
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response Body:', data);
    
    if (response.ok) {
      console.log('Successfully created question via API!');
    } else {
      console.error('Failed to create question via API');
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testCreateQuestion();
