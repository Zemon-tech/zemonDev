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

// User schema (simplified for checking)
const userSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  fullName: String,
  username: String,
  zemonStreak: { type: Number, default: 0 },
  longestZemonStreak: { type: Number, default: 0 },
  lastZemonVisit: { type: Date, default: null }
}, { strict: false }); // Allow fields not in schema

const User = mongoose.model('User', userSchema);

// Check and fix zemon streak fields
const checkAndFixZemonStreakFields = async () => {
  try {
    console.log('Checking zemon streak fields in database...');
    
    // Get all users
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    let usersWithFields = 0;
    let usersWithoutFields = 0;
    
    for (const user of allUsers) {
      const hasZemonStreak = user.zemonStreak !== undefined;
      const hasLongestStreak = user.longestZemonStreak !== undefined;
      const hasLastVisit = user.lastZemonVisit !== undefined;
      
      if (hasZemonStreak && hasLongestStreak && hasLastVisit) {
        usersWithFields++;
        console.log(`✅ User ${user.email || user.username}: zemonStreak=${user.zemonStreak}, longestStreak=${user.longestZemonStreak}, lastVisit=${user.lastZemonVisit}`);
      } else {
        usersWithoutFields++;
        console.log(`❌ User ${user.email || user.username}: zemonStreak=${hasZemonStreak}, longestStreak=${hasLongestStreak}, lastVisit=${hasLastVisit}`);
        
        // Fix missing fields
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
        console.log(`🔧 Fixed fields for user ${user.email || user.username}`);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Users with all fields: ${usersWithFields}`);
    console.log(`- Users without fields: ${usersWithoutFields}`);
    console.log(`- Total users processed: ${allUsers.length}`);
    
    if (usersWithoutFields > 0) {
      console.log(`\n✅ Fixed ${usersWithoutFields} users with missing fields`);
    } else {
      console.log(`\n✅ All users already have zemon streak fields`);
    }
    
  } catch (error) {
    console.error('Error checking/fixing zemon streak fields:', error);
  }
};

// Run check
const runCheck = async () => {
  await connectDB();
  await checkAndFixZemonStreakFields();
  await mongoose.disconnect();
  console.log('Check completed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runCheck();
}

module.exports = { checkAndFixZemonStreakFields }; 