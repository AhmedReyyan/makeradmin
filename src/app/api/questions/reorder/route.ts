import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { QuestionModel } from '@/lib/db-models';

// POST /api/questions/reorder - Reorder questions
export async function POST(request: Request) {
  try {
    const { orderMap } = await request.json();
    await connectToDatabase();
    
    // Update each question's order in the database
    const bulkOps = orderMap.map(({ id, order }: { id: string; order: number }) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order, updatedAt: new Date().toISOString() } }
      }
    }));
    
    await QuestionModel.bulkWrite(bulkOps);
    
    return NextResponse.json({ 
      success: true,
      message: 'Questions reordered successfully' 
    });
  } catch (error) {
    console.error('Error reordering questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder questions' },
      { status: 500 }
    );
  }
}
