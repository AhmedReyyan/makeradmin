import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const path = searchParams.get("path")
    const completed = searchParams.get("completed")

    const db = await getDatabase()

    // Build filter
    const filter: any = {}
    if (path && path !== "all") {
      filter.businessPath = path
    }
    if (completed && completed !== "all") {
      filter.completed = completed === "true"
    }

    // Get total count
    const total = await db.collection("responses").countDocuments(filter)

    // Get paginated responses
    const responses = await db
      .collection("responses")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Format responses
    const formatted = responses.map((r) => ({
      id: r._id.toString(),
      sessionId: r.sessionId,
      responses: r.responses || [],
      completed: r.completed || false,
      userInfo: r.userInfo || {},
      businessPath: r.businessPath || "Unknown",
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString(),
    }))

    return NextResponse.json({
      responses: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Failed to fetch responses:", error)
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 })
  }
}
