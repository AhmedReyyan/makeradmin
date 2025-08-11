import mongoose, { Schema } from 'mongoose';
import { Question as QuestionType } from './questions';

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the model or use it if it already exists
export const QuestionModel = mongoose.models.Question || 
  mongoose.model<QuestionType>('Question', QuestionSchema);

// Functions to work with the Question model
export async function getAllQuestions() {
  try {
    return await QuestionModel.find({}).sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function getQuestionById(id: string) {
  try {
    return await QuestionModel.findOne({ id }).lean();
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    return null;
  }
}

export async function createQuestion(question: QuestionType) {
  try {
    const newQuestion = new QuestionModel(question);
    await newQuestion.save();
    return newQuestion.toObject();
  } catch (error) {
    console.error('Error creating question:', error);
    return null;
  }
}

export async function updateQuestion(id: string, updates: Partial<QuestionType>) {
  try {
    const updatedQuestion = await QuestionModel.findOneAndUpdate(
      { id },
      { ...updates, updatedAt: new Date() },
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
