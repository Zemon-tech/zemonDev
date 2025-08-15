import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zemon';

async function addProfileVisibilityField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const userCollection = db.collection('users');

    // Update all existing users to add profileVisibility field with default values
    const result = await userCollection.updateMany(
      { profileVisibility: { $exists: false } },
      {
        $set: {
          profileVisibility: {
            isPublic: true,
            showEmail: false,
            showStats: true,
            showAchievements: true,
            showSkills: true,
            showSocialLinks: true,
            showCollegeDetails: true,
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with profileVisibility field`);

    // Verify the update
    const usersWithoutVisibility = await userCollection.countDocuments({
      profileVisibility: { $exists: false }
    });

    if (usersWithoutVisibility === 0) {
      console.log('✅ All users now have profileVisibility field');
    } else {
      console.log(`⚠️  ${usersWithoutVisibility} users still missing profileVisibility field`);
    }

  } catch (error) {
    console.error('Error adding profileVisibility field:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
addProfileVisibilityField();
