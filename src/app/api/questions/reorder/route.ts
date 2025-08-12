import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function PUT(request: NextRequest) {
  try {
    const { orderedIds } = await request.json()
    const db = await getDatabase()

    // Update each question with its new order
    const bulkOps = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { id },
        update: {
          $set: {
            order: index + 1,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }))

    await db.collection("questions").bulkWrite(bulkOps)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder questions:", error)
    return NextResponse.json({ error: "Failed to reorder questions" }, { status: 500 })
  }
}
