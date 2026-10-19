import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Builds the MongoDB connection URI from environment variables
 */
function getMongoUri(): string {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const username = process.env.DBUSERNAME;
  const password = process.env.DBPASSWORD;
  const databaseName = process.env.DBNAME || 'tutor_book';
  const databaseLink = process.env.DBLINK;

  if (username && password && databaseLink) {
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${databaseLink}/${databaseName}?retryWrites=true&w=majority`;
  }

  return `mongodb://127.0.0.1:27017/${databaseName}`;
}

/**
 * Connect to MongoDB database
 */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MongoDB connection error: ${message}`);
    throw error;
  }
}

// Alias to maintain compatibility with original `db` export
export const db = connectDB;

