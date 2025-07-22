import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import ArenaChannel from '../models/arenaChannel.model';

async function migrateChannelTypes() {
  const dbUri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!dbUri) {
    console.error('No MongoDB URI found in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB');

  // Update 'text' → 'chat'
  const textResult = await ArenaChannel.updateMany(
    { type: 'text' },
    { $set: { type: 'chat' } }
  );
  console.log(`Updated ${textResult.modifiedCount} channels from 'text' to 'chat'`);

  // Update 'readonly' → 'showcase'
  const readonlyResult = await ArenaChannel.updateMany(
    { type: 'readonly' },
    { $set: { type: 'showcase' } }
  );
  console.log(`Updated ${readonlyResult.modifiedCount} channels from 'readonly' to 'showcase'`);

  await mongoose.disconnect();
  console.log('Migration complete. Disconnected from MongoDB.');
}

migrateChannelTypes().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 