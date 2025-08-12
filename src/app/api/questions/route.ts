import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const questions = await db.collection("questions").find({}).toArray();
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const result = await db.collection("questions").insertOne({
    ...data,
    createdAt: new Date(),
  });

  return NextResponse.json({ insertedId: result.insertedId });
}
