// Simple test for get all questions API
require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testGetQuestions() {
  try {
    console.log('Testing GET all questions API...');
    const response = await fetch('http://localhost:3000/api/questions');
    const data = await response.json();
    console.log('Response:', data);
    console.log('Test completed.');
  } catch (error) {
    console.error('Test failed with exception:', error);
  }
}

testGetQuestions();
