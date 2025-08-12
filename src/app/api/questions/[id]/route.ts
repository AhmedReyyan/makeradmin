import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// Use the correct context type for all handlers
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const db = await getDatabase();
    const question = await db.collection("questions").findOne({ id });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const formatted = {
      id: question.id,
      text: question.text || "",
      type: question.type || "text",
      paths: question.paths || ["New Business"],
      required: question.required || false,
      helpText: question.helpText || "",
      status: question.status || "draft",
      options: question.options || [],
      order: question.order || 1,
      createdAt: question.createdAt || new Date().toISOString(),
      updatedAt: question.updatedAt || new Date().toISOString(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch question:", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const db = await getDatabase();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const result = await db
      .collection("questions")
      .updateOne({ id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updated = await db.collection("questions").findOne({ id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const db = await getDatabase();
    const result = await db.collection("questions").deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
