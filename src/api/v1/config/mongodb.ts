import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

function getMongoUri(): string {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const username = process.env.DBUSERNAME;
  const password = process.env.DBPASSWORD;
  const databaseName = process.env.DBNAME;
  const databaseLink = process.env.DBLINK;

  if (username && password && databaseLink) {
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${databaseLink}/${databaseName || ""}?retryWrites=true&w=majority`;
  }

  throw new Error("MongoDB connection configuration is missing in environment variables");
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();
  try {
    const conn = await mongoose.connect(uri);
    console.log(`Database connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Database connection failed: ${message}`);
    throw err;
  }
}

export const db = connectDB;
