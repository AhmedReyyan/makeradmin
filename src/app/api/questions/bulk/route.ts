import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function PUT(request: NextRequest) {
  try {
    const { ids, patch } = await request.json()
    const db = await getDatabase()

    const updateData = {
      ...patch,
      updatedAt: new Date().toISOString(),
    }

    await db.collection("questions").updateMany({ id: { $in: ids } }, { $set: updateData })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to bulk update questions:", error)
    return NextResponse.json({ error: "Failed to bulk update questions" }, { status: 500 })
  }
}
