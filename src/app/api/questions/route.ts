import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { 
  QuestionModel, 
  getAllQuestions, 
  createQuestion 
} from '@/lib/db-models';

// GET /api/questions - Fetch all questions
export async function GET() {
  try {
    await connectToDatabase();
    const questions = await getAllQuestions();
    
    return NextResponse.json({ 
      success: true, 
      questions 
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new question
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.text || !body.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields', 
          details: { 
            id: !body.id ? 'Missing id' : undefined,
            text: !body.text ? 'Missing text' : undefined,
            type: !body.type ? 'Missing type' : undefined
          } 
        },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Create the question
    const question = await createQuestion(body);
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Failed to create question' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      question 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    
    // Determine if it's a validation error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = errorMessage.includes('duplicate key') ? 409 : 500;
    
    return NextResponse.json(
      { success: false, error: 'Failed to create question', message: errorMessage },
      { status }
    );
  }
}

// Handler for bulk operations
export async function PATCH(request: Request) {
  try {
    const { ids, patch } = await request.json();
    await connectToDatabase();
    
    // Update multiple questions
    await QuestionModel.updateMany(
      { id: { $in: ids } },
      { $set: { ...patch, updatedAt: new Date().toISOString() } }
    );
    
    return NextResponse.json({ 
      success: true,
      message: `Updated ${ids.length} questions` 
    });
  } catch (error) {
    console.error('Error bulk updating questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update questions' },
      { status: 500 }
    );
  }
}
