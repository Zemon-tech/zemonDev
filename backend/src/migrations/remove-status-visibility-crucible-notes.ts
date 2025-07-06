import mongoose from 'mongoose';
import env from '../config/env';
import { CrucibleNote } from '../models';

/**
 * Migration script to remove status and visibility fields from CrucibleNote documents
 * 
 * Run this script with: npx ts-node src/migrations/remove-status-visibility-crucible-notes.ts
 */

async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the collection directly to use updateMany
    const collection = mongoose.connection.collection('cruciblenotes');
    
    console.log('Removing status and visibility fields from CrucibleNote documents...');
    
    // Use updateMany to unset the fields
    const result = await collection.updateMany(
      {}, 
      { $unset: { status: "", visibility: "" } }
    );
    
    console.log(`Migration complete. Modified ${result.modifiedCount} documents.`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 