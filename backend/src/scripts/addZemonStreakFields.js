const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zemon');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified for migration)
const userSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  fullName: String,
  username: String,
  // ... other fields
  zemonStreak: { type: Number, default: 0 },
  longestZemonStreak: { type: Number, default: 0 },
  lastZemonVisit: { type: Date, default: null }
}, { strict: false }); // Allow fields not in schema

const User = mongoose.model('User', userSchema);

// Migration function
const addZemonStreakFields = async () => {
  try {
    console.log('Starting migration: Adding zemon streak fields to existing users...');
    
    // Find all users that don't have zemonStreak field
    const usersToUpdate = await User.find({
      $or: [
        { zemonStreak: { $exists: false } },
        { longestZemonStreak: { $exists: false } },
        { lastZemonVisit: { $exists: false } }
      ]
    });
    
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    if (usersToUpdate.length === 0) {
      console.log('No users need updating. Migration complete.');
      return;
    }
    
    // Update each user
    let updatedCount = 0;
    for (const user of usersToUpdate) {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              zemonStreak: user.zemonStreak || 0,
              longestZemonStreak: user.longestZemonStreak || 0,
              lastZemonVisit: user.lastZemonVisit || null
            }
          }
        );
        updatedCount++;
        console.log(`Updated user: ${user.email || user.username}`);
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error);
      }
    }
    
    console.log(`Migration complete! Updated ${updatedCount} users.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await addZemonStreakFields();
  await mongoose.disconnect();
  console.log('Migration script completed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { addZemonStreakFields }; 