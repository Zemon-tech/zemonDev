import mongoose from 'mongoose';
import env from './env';

/**
 * Connect to MongoDB using Mongoose
 * @returns Promise<typeof mongoose>
 */
const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export default connectDB; 