// Script to verify questions in MongoDB
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'single_select', 'multi_select', 'date']
  },
  paths: [{ type: String, enum: ['New Business', 'Existing Business', 'Growth Stage'] }],
  required: { type: Boolean, default: false },
  helpText: { type: String, default: '' },
  options: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  order: { type: Number, required: true, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

// Create the model
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function verifyQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Count questions
    const count = await Question.countDocuments();
    console.log(`Found ${count} questions in the database.`);
    
    // List all questions
    if (count > 0) {
      const questions = await Question.find().sort({ order: 1 }).lean();
      console.log('\nQuestions in the database:');
      questions.forEach((q, index) => {
        console.log(`\n[${index + 1}] ${q.id} - ${q.text || '(Untitled)'}`);
        console.log(`  Type: ${q.type}, Status: ${q.status}, Order: ${q.order}`);
        console.log(`  Paths: ${q.paths.join(', ')}`);
        console.log(`  Created: ${new Date(q.createdAt).toLocaleString()}`);
        console.log(`  Updated: ${new Date(q.updatedAt).toLocaleString()}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

verifyQuestions();
