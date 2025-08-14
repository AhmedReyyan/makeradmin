import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // Await params before using them
  try {
    const db = await getDatabase();
    const response = await db.collection("responses").findOne({ _id: new ObjectId(id) });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    const formatted = {
      id: response._id.toString(),
      sessionId: response.sessionId,
      responses: response.responses || [],
      completed: response.completed || false,
      userInfo: response.userInfo || {},
      businessPath: response.businessPath || "Unknown",
      createdAt: response.createdAt || new Date().toISOString(),
      updatedAt: response.updatedAt || new Date().toISOString(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch response:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // Await params before using them
  try {
    const db = await getDatabase();
    const result = await db.collection("responses").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete response:", error);
    return NextResponse.json({ error: "Failed to delete response" }, { status: 500 });
  }
}
