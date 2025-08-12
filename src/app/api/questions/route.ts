import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { newQuestionId } from "@/lib/id"
import type { Question } from "@/lib/questions"

export async function GET() {
  try {
    const db = await getDatabase()
    const questions = await db.collection("questions").find({}).sort({ order: 1 }).toArray()

    // Convert MongoDB _id to our format
    const formatted = questions.map((q) => ({
      id: q.id || q._id.toString(),
      text: q.text || "",
      type: q.type || "text",
      paths: q.paths || ["New Business"],
      required: q.required || false,
      helpText: q.helpText || "",
      status: q.status || "draft",
      options: q.options || [],
      order: q.order || 1,
      createdAt: q.createdAt || new Date().toISOString(),
      updatedAt: q.updatedAt || new Date().toISOString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const now = new Date().toISOString()
    const question: Question = {
      id: newQuestionId(),
      text: body.text || "",
      type: body.type || "text",
      paths: body.paths || ["New Business"],
      required: body.required || false,
      helpText: body.helpText || "",
      status: body.status || "draft",
      options: body.options || [],
      order: body.order || 1,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection("questions").insertOne(question)
    return NextResponse.json(question)
  } catch (error) {
    console.error("Failed to create question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
