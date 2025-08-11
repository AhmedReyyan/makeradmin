// Script to seed the MongoDB database with initial questions
import { Question } from '../src/lib/questions';
import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makeradmin';

// Define the schema for the Question model
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
  status: { type: String, enum: ['active', 'inactive', 'draft'] },
  order: { type: Number, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

// Model
const QuestionModel = mongoose.models.Question || 
  mongoose.model('Question', QuestionSchema, 'questions');

const SEED: Question[] = [
  {
    id: "Q-1234",
    text: "What is your primary business idea or concept?",
    type: "text",
    paths: ["New Business"],
    required: true,
    helpText: "This helps us understand your business foundation and tailor recommendations.",
    status: "active",
    options: [],
    order: 1,
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2025-01-15T14:56:00.000Z",
  },
  {
    id: "Q-2235",
    text: "Which industry best describes your business?",
    type: "single_select",
    paths: ["New Business", "Existing Business", "Growth Stage"],
    required: true,
    helpText: "",
    status: "active",
    options: ["Technology", "Retail", "Healthcare", "Other"],
    order: 2,
    createdAt: "2025-01-11T09:30:00.000Z",
    updatedAt: "2025-01-14T16:10:00.000Z",
  },
  {
    id: "Q-3236",
    text: "What are your primary revenue streams?",
    type: "multi_select",
    paths: ["Existing Business"],
    required: false,
    helpText: "",
    status: "draft",
    options: ["Subscriptions", "One-time Sales", "Ads", "Services"],
    order: 3,
    createdAt: "2025-01-12T08:45:00.000Z",
    updatedAt: "2025-01-13T13:35:00.000Z",
  },
  {
    id: "Q-4237",
    text: "When did you start your business?",
    type: "date",
    paths: ["Existing Business"],
    required: false,
    helpText: "",
    status: "inactive",
    options: [],
    order: 4,
    createdAt: "2025-01-12T08:45:00.000Z",
    updatedAt: "2025-01-12T12:05:00.000Z",
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB with appropriate options based on the connection URI
    console.log('Connecting to database...');
    const opts: mongoose.ConnectOptions = {};
    
    // Only use SSL/TLS options for Atlas clusters
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      Object.assign(opts, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      });
    }
    
    await mongoose.connect(MONGODB_URI, opts);
    console.log('Connected to MongoDB');
    
    // Delete existing questions if any
    console.log('Cleaning existing data...');
    await QuestionModel.deleteMany({});
    
    // Insert seed data
    console.log('Inserting seed data...');
    await QuestionModel.insertMany(SEED);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Read environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

seedDatabase();
