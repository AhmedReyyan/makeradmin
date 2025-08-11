// Script to verify MongoDB connection and create a test question
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
  paths: [{ type: String }],
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

async function run() {
  try {
    console.log('MongoDB URI:', MONGODB_URI ? 'URI is set' : 'URI is not set');
    if (!MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set!');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Create a test model
    const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
    
    // Create a test question
    const testQuestion = {
      id: `TEST-${Date.now()}`,
      text: "Test question created at " + new Date().toISOString(),
      type: "text",
      paths: ["New Business"],
      required: false,
      helpText: "This is a test question",
      status: "draft",
      order: 999,
      options: []
    };
    
    console.log('Creating test question:', testQuestion);
    const newQuestion = new Question(testQuestion);
    await newQuestion.save();
    console.log('Test question created successfully!');
    
    // Find the question we just created
    const found = await Question.findOne({ id: testQuestion.id }).lean();
    console.log('Retrieved question from database:', found);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
