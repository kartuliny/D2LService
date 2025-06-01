import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
    const uri = process.env.MONGO_DB_URI || "";
    const dbName = process.env.MONGO_DB_NAME || "";

    try {
        await mongoose.connect(uri, { dbName });
        console.log("Connected to database");
    } catch (error) {
        console.log(error);
        console.log("Error connecting to database");
        throw error;
    }
}