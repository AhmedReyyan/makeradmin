import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  await db.collection("questions").updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );

  return NextResponse.json({ message: "Updated successfully" });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  await db.collection("questions").deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ message: "Deleted successfully" });
}



export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  // Query by your custom 'id' field, or use _id if you prefer
  const question = await db.collection("questions").findOne({ id: id });

  if (!question) {
    return NextResponse.json({ message: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question);
}