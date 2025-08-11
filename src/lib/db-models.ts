import mongoose, { Schema } from 'mongoose';
import { Question as QuestionType } from './questions';
import connectToDatabase from './mongodb';

// Define the schema for the Question model
const QuestionSchema = new Schema<QuestionType>({
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

// Create the model or use it if it already exists
export const QuestionModel = mongoose.models.Question || 
  mongoose.model<QuestionType>('Question', QuestionSchema, 'questions');

// Functions to work with the Question model
export async function getAllQuestions() {
  try {
    await connectToDatabase();
    return await QuestionModel.find({}).sort({ order: 1 }).lean();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function getQuestionById(id: string) {
  try {
    await connectToDatabase();
    return await QuestionModel.findOne({ id }).lean();
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    return null;
  }
}

export async function createQuestion(question: QuestionType) {
  try {
    await connectToDatabase();
    
    // Ensure all required fields are present
    if (!question.id || !question.text || !question.type) {
      throw new Error('Missing required fields for question');
    }
    
    // Get the highest order value and add 1 if not provided
    if (!question.order) {
      try {
        const results = await QuestionModel.find({})
          .sort({ order: -1 })
          .limit(1)
          .lean();
        
        const lastOrder = results.length > 0 && results[0].order ? results[0].order : 0;
        question.order = lastOrder + 1;
      } catch (err) {
        console.error('Error determining order:', err);
        question.order = 1; // Default to 1 if we can't determine the order
      }
    }
    
    // Set timestamps if not provided
    if (!question.createdAt) {
      question.createdAt = new Date().toISOString();
    }
    
    if (!question.updatedAt) {
      question.updatedAt = new Date().toISOString();
    }
    
    // Create the new question
    const newQuestion = new QuestionModel(question);
    await newQuestion.save();
    
    return newQuestion.toObject();
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

export async function updateQuestion(id: string, updates: Partial<QuestionType>) {
  try {
    await connectToDatabase();
    const updatedQuestion = await QuestionModel.findOneAndUpdate(
      { id },
      { ...updates, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();
    return updatedQuestion;
  } catch (error) {
    console.error(`Error updating question ${id}:`, error);
    return null;
  }
}

export async function deleteQuestion(id: string) {
  try {
    await QuestionModel.deleteOne({ id });
    return true;
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error);
    return false;
  }
}
