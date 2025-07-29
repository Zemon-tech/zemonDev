import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import User from '../models/user.model';

async function addUserProfileFields() {
  const dbUri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!dbUri) {
    console.error('No MongoDB URI found in environment variables.');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Get total count of users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Update users to add new profile fields
    const profileUpdateResult = await User.updateMany(
      {},
      {
        $set: {
          'profile.aboutMe': null,
          'profile.location': null,
          'profile.skills': [],
          'profile.toolsAndTech': [],
          'college.collegeName': null,
          'college.course': null,
          'college.branch': null,
          'college.year': null,
          'college.city': null,
          'college.state': null,
          'socialLinks.portfolio': null,
          'socialLinks.github': null,
          'socialLinks.linkedin': null,
          'socialLinks.twitter': null,
        }
      }
    );

    console.log(`Updated ${profileUpdateResult.modifiedCount} users with new profile fields`);

    // Verify the migration by checking a few users
    const sampleUsers = await User.find({}).limit(3);
    console.log('\nSample user after migration:');
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - Profile fields:`, {
        aboutMe: user.profile?.aboutMe,
        location: user.profile?.location,
        skills: user.profile?.skills,
        toolsAndTech: user.profile?.toolsAndTech
      });
      console.log(`  - College fields:`, user.college);
      console.log(`  - Social links:`, user.socialLinks);
    });

    await mongoose.disconnect();
    console.log('\nMigration complete. Disconnected from MongoDB.');
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addUserProfileFields().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 