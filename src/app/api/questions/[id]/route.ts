import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { 
  getQuestionById, 
  updateQuestion, 
  deleteQuestion 
} from '@/lib/db-models';

// Make params.id safe to use
interface Params {
  id: string;
}

// GET /api/questions/[id] - Get a single question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await connectToDatabase();
    
    const question = await getQuestionById(id);
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      question 
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// PATCH /api/questions/[id] - Update a question
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    await connectToDatabase();
    
    const updatedQuestion = await updateQuestion(id, body);
    
    if (!updatedQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      question: updatedQuestion 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await connectToDatabase();
    
    const success = await deleteQuestion(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Question deleted successfully' 
    });
  } catch (error) {
    console.error(`Error deleting question ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
