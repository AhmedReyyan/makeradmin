// Test updating a question via the API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testUpdateQuestion() {
  try {
    // First, let's create a question to update
    const testId = `API-TEST-UPDATE-${Date.now()}`;
    const initialQuestion = {
      id: testId,
      text: `Initial question text at ${new Date().toISOString()}`,
      type: 'text',
      paths: ['New Business'],
      required: false,
      helpText: 'This is a test question for update',
      status: 'draft',
      order: 1000,
      options: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create the initial question
    console.log('Creating initial test question...');
    const createResponse = await fetch('http://localhost:3000/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialQuestion)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create test question: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log('Initial question created successfully:', createData.question.id);

    // Now update the question
    const updates = {
      text: `Updated question text at ${new Date().toISOString()}`,
      helpText: 'This question was updated via API',
      required: true,
      status: 'active'
    };

    console.log(`Sending PATCH request to update question ${testId} with:`, updates);
    
    const updateResponse = await fetch(`http://localhost:3000/api/questions/${testId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    console.log('API Response Status:', updateResponse.status);
    const updateData = await updateResponse.json();
    console.log('API Response Body:', updateData);

    if (updateResponse.ok && updateData.success) {
      console.log('Successfully updated question via API!');
      
      // Verify the updates were applied
      const verifyUpdates = Object.entries(updates).filter(
        ([key, value]) => updateData.question[key] === value
      );
      
      console.log(`Verified ${verifyUpdates.length}/${Object.keys(updates).length} fields were updated correctly`);
    } else {
      console.error('Failed to update question:', updateData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error in API test:', error);
  }
}

testUpdateQuestion();
