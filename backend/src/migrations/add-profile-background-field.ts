import mongoose from 'mongoose';
import config from '../config/env';

const addProfileBackgroundField = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User');

    // Update all existing users to have a default profileBackground
    const result = await User.updateMany(
      { profileBackground: { $exists: false } },
      {
        $set: {
          profileBackground: {
            type: 'gradient',
            value: 'linear-gradient(to right, #0073b1, #f4a261)',
            name: 'LinkedIn Blue'
          }
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with default profile background`);

    // Verify the update
    const usersWithoutBackground = await User.countDocuments({
      profileBackground: { $exists: false }
    });

    console.log(`Users without profileBackground: ${usersWithoutBackground}`);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  addProfileBackgroundField();
}

export default addProfileBackgroundField; 