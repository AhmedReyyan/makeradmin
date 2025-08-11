// Test script for questions API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

// Test creating a question
async function testCreateQuestion() {
  console.log('Testing CREATE question API...');
  
  const newQuestion = {
    id: `Q-TEST-${Date.now()}`,
    text: 'Test question created via API',
    type: 'text',
    paths: ['New Business'],
    required: false,
    helpText: 'This is a test question',
    status: 'draft',
    options: [],
    order: 99
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestion)
    });
    
    const data = await response.json();
    console.log('CREATE response:', data);
    
    if (data.success) {
      console.log('✅ CREATE test passed');
      return data.question;
    } else {
      console.log('❌ CREATE test failed');
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ CREATE test failed with exception');
    console.error('Exception:', error.message);
    return null;
  }
}

// Test getting all questions
async function testGetAllQuestions() {
  console.log('\nTesting GET ALL questions API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    const data = await response.json();
    
    console.log(`GET ALL response: ${data.success ? 'Success' : 'Failed'}`);
    console.log(`Found ${data.questions ? data.questions.length : 0} questions`);
    
    if (data.success) {
      console.log('✅ GET ALL test passed');
      return true;
    } else {
      console.log('❌ GET ALL test failed');
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ GET ALL test failed with exception');
    console.error('Exception:', error.message);
    return false;
  }
}

// Test getting a single question
async function testGetQuestion(id) {
  console.log(`\nTesting GET question API for ID: ${id}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    const data = await response.json();
    
    console.log('GET response:', data);
    
    if (data.success) {
      console.log('✅ GET test passed');
      return true;
    } else {
      console.log('❌ GET test failed');
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ GET test failed with exception');
    console.error('Exception:', error.message);
    return false;
  }
}

// Test updating a question
async function testUpdateQuestion(id) {
  console.log(`\nTesting UPDATE question API for ID: ${id}...`);
  
  const updates = {
    text: `Updated text ${new Date().toISOString()}`,
    helpText: 'This question was updated via API test'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    console.log('UPDATE response:', data);
    
    if (data.success) {
      console.log('✅ UPDATE test passed');
      return true;
    } else {
      console.log('❌ UPDATE test failed');
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ UPDATE test failed with exception');
    console.error('Exception:', error.message);
    return false;
  }
}

// Test deleting a question
async function testDeleteQuestion(id) {
  console.log(`\nTesting DELETE question API for ID: ${id}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    console.log('DELETE response:', data);
    
    if (data.success) {
      console.log('✅ DELETE test passed');
      return true;
    } else {
      console.log('❌ DELETE test failed');
      console.error('Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ DELETE test failed with exception');
    console.error('Exception:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== STARTING API TESTS ===');
  
  // Test get all first
  await testGetAllQuestions();
  
  // Test create and get created question
  const createdQuestion = await testCreateQuestion();
  
  if (createdQuestion) {
    // Test get single
    await testGetQuestion(createdQuestion.id);
    
    // Test update
    await testUpdateQuestion(createdQuestion.id);
    
    // Test get after update to verify
    await testGetQuestion(createdQuestion.id);
    
    // Test delete
    await testDeleteQuestion(createdQuestion.id);
    
    // Verify deletion
    await testGetQuestion(createdQuestion.id);
  }
  
  console.log('\n=== API TESTS COMPLETED ===');
}

// Run the tests
runTests().catch(console.error);
