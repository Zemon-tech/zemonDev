import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import User from '../models/user.model';

async function fixUserProfileFields() {
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

    // First, ensure all users have the profile, college, and socialLinks objects
    const objectInitResult = await User.updateMany(
      {
        $or: [
          { profile: { $exists: false } },
          { college: { $exists: false } },
          { socialLinks: { $exists: false } }
        ]
      },
      {
        $set: {
          profile: {},
          college: {},
          socialLinks: {}
        }
      }
    );
    console.log(`Initialized missing objects for ${objectInitResult.modifiedCount} users`);

    // Update users to fix profile fields with proper default values
    const profileUpdateResult = await User.updateMany(
      {},
      {
        $set: {
          'profile.aboutMe': '',
          'profile.location': '',
          'profile.skills': [],
          'profile.toolsAndTech': [],
          'college.collegeName': '',
          'college.course': '',
          'college.branch': '',
          'college.year': 0,
          'college.city': '',
          'college.state': '',
          'socialLinks.portfolio': '',
          'socialLinks.github': '',
          'socialLinks.linkedin': '',
          'socialLinks.twitter': '',
        }
      }
    );

    console.log(`Updated ${profileUpdateResult.modifiedCount} users with proper profile field defaults`);

    // Also update any users that might have null values to empty strings
    const nullFixResult = await User.updateMany(
      {
        $or: [
          { 'profile.aboutMe': null },
          { 'profile.location': null },
          { 'college.collegeName': null },
          { 'college.course': null },
          { 'college.branch': null },
          { 'college.city': null },
          { 'college.state': null },
          { 'socialLinks.portfolio': null },
          { 'socialLinks.github': null },
          { 'socialLinks.linkedin': null },
          { 'socialLinks.twitter': null }
        ]
      },
      {
        $set: {
          'profile.aboutMe': '',
          'profile.location': '',
          'college.collegeName': '',
          'college.course': '',
          'college.branch': '',
          'college.city': '',
          'college.state': '',
          'socialLinks.portfolio': '',
          'socialLinks.github': '',
          'socialLinks.linkedin': '',
          'socialLinks.twitter': '',
        }
      }
    );

    console.log(`Fixed null values for ${nullFixResult.modifiedCount} users`);

    // Verify the migration by checking a few users
    const sampleUsers = await User.find({}).limit(3);
    console.log('\nSample user after migration:');
    sampleUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - Profile fields:`, {
        aboutMe: user.profile?.aboutMe || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills || [],
        toolsAndTech: user.profile?.toolsAndTech || []
      });
      console.log(`  - College fields:`, {
        collegeName: user.college?.collegeName || '',
        course: user.college?.course || '',
        branch: user.college?.branch || '',
        year: user.college?.year,
        city: user.college?.city || '',
        state: user.college?.state || ''
      });
      console.log(`  - Social links:`, {
        portfolio: user.socialLinks?.portfolio || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || ''
      });
    });

    await mongoose.disconnect();
    console.log('\nMigration complete. Disconnected from MongoDB.');
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixUserProfileFields().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 