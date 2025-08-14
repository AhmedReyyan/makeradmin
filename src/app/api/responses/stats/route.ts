import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get basic stats
    const totalResponses = await db.collection("responses").countDocuments()
    const completedResponses = await db.collection("responses").countDocuments({ completed: true })
    const incompleteResponses = totalResponses - completedResponses

    // Get path breakdown
    const pathStats = await db
      .collection("responses")
      .aggregate([{ $group: { _id: "$businessPath", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray()

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentResponses = await db.collection("responses").countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    return NextResponse.json({
      totalResponses,
      completedResponses,
      incompleteResponses,
      recentResponses,
      pathBreakdown: pathStats.map((p) => ({
        path: p._id || "Unknown",
        count: p.count,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch response stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
