import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import ArenaChannel from '../models/arenaChannel.model';

export async function changeParentChannelsToInfo() {
  try {
    console.log('Starting migration: Change parent channels to info type...');
    
    // Find all parent channels (channels where parentChannelId is null or doesn't exist)
    const parentChannels = await ArenaChannel.find({ 
      $or: [
        { parentChannelId: null },
        { parentChannelId: { $exists: false } }
      ]
    });
    
    console.log(`Found ${parentChannels.length} parent channels to update`);
    
    // Update all parent channels to type 'info'
    const result = await ArenaChannel.updateMany(
      { 
        $or: [
          { parentChannelId: null },
          { parentChannelId: { $exists: false } }
        ]
      },
      { $set: { type: 'info' } }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} parent channels to type 'info'`);
    
    // Verify the changes
    const updatedChannels = await ArenaChannel.find({ type: 'info' });
    console.log(`Verified: ${updatedChannels.length} channels now have type 'info'`);
    
    // Log the updated channels for verification
    updatedChannels.forEach(channel => {
      console.log(`- ${channel.name} (${channel._id})`);
    });
    
    console.log('Migration completed successfully!');
    return { success: true, updatedCount: result.modifiedCount };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const dbUri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!dbUri) {
    console.error('No MongoDB URI found in environment variables.');
    process.exit(1);
  }
  
  mongoose.connect(dbUri)
    .then(() => {
      console.log('Connected to MongoDB');
      return changeParentChannelsToInfo();
    })
    .then((result) => {
      console.log('Migration result:', result);
      return mongoose.disconnect();
    })
    .then(() => {
      console.log('Migration complete. Disconnected from MongoDB.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
} 