// test-questions-crud.js
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://user1:user1@cluster0.wkqmr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("makeradmin");
    const collection = db.collection("questions");

    // Sample question data based on your DraftState structure
    const questionData = {
      text: "What is your primary business idea or concept?",
      type: "text",
      paths: ["New Business"],
      required: false,
      helpText: "This helps us understand your business foundation and tailor recommendations.",
      options: [],
      order: 1,
      status: "draft",
      createdAt: new Date(),
    };

    // 1️⃣ Insert
    const insertResult = await collection.insertOne(questionData);
    console.log("Inserted question with _id:", insertResult.insertedId);

    // 2️⃣ Read
    const found = await collection.findOne({ _id: insertResult.insertedId });
    console.log("Found question:", found);

    // 3️⃣ Update
    const updateData = { text: "Updated business idea question?", required: true };
    await collection.updateOne({ _id: insertResult.insertedId }, { $set: updateData });
    console.log("Updated question");

    // Verify update
    const updated = await collection.findOne({ _id: insertResult.insertedId });
    console.log("Updated question data:", updated);

    // 4️⃣ Delete
    await collection.deleteOne({ _id: insertResult.insertedId });
    console.log("Deleted question");

    // Verify delete
    const afterDelete = await collection.findOne({ _id: insertResult.insertedId });
    console.log("After delete (should be null):", afterDelete);

  } catch (error) {
    console.error("Error in MongoDB test:", error);
  } finally {
    await client.close();
  }
}

run();
