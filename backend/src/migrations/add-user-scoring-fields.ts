import mongoose from 'mongoose';
import env from '../config/env';

async function addUserScoringFields() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const usersCollection = db.collection('users');

    // Add new scoring fields to all users
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          'stats.totalPoints': 0,
          'stats.averageScore': 0,
          'stats.highestScore': 0,
          'stats.problemsByDifficulty.easy.solved': 0,
          'stats.problemsByDifficulty.easy.averageScore': 0,
          'stats.problemsByDifficulty.easy.totalPoints': 0,
          'stats.problemsByDifficulty.medium.solved': 0,
          'stats.problemsByDifficulty.medium.averageScore': 0,
          'stats.problemsByDifficulty.medium.totalPoints': 0,
          'stats.problemsByDifficulty.hard.solved': 0,
          'stats.problemsByDifficulty.hard.averageScore': 0,
          'stats.problemsByDifficulty.hard.totalPoints': 0,
          'stats.problemsByDifficulty.expert.solved': 0,
          'stats.problemsByDifficulty.expert.averageScore': 0,
          'stats.problemsByDifficulty.expert.totalPoints': 0,
          'stats.problemsByCategory.algorithms.solved': 0,
          'stats.problemsByCategory.algorithms.averageScore': 0,
          'stats.problemsByCategory.algorithms.totalPoints': 0,
          'stats.problemsByCategory.system-design.solved': 0,
          'stats.problemsByCategory.system-design.averageScore': 0,
          'stats.problemsByCategory.system-design.totalPoints': 0,
          'stats.problemsByCategory.web-development.solved': 0,
          'stats.problemsByCategory.web-development.averageScore': 0,
          'stats.problemsByCategory.web-development.totalPoints': 0,
          'stats.problemsByCategory.mobile-development.solved': 0,
          'stats.problemsByCategory.mobile-development.averageScore': 0,
          'stats.problemsByCategory.mobile-development.totalPoints': 0,
          'stats.problemsByCategory.data-science.solved': 0,
          'stats.problemsByCategory.data-science.averageScore': 0,
          'stats.problemsByCategory.data-science.totalPoints': 0,
          'stats.problemsByCategory.devops.solved': 0,
          'stats.problemsByCategory.devops.averageScore': 0,
          'stats.problemsByCategory.devops.totalPoints': 0,
          'stats.problemsByCategory.frontend.solved': 0,
          'stats.problemsByCategory.frontend.averageScore': 0,
          'stats.problemsByCategory.frontend.totalPoints': 0,
          'stats.problemsByCategory.backend.solved': 0,
          'stats.problemsByCategory.backend.averageScore': 0,
          'stats.problemsByCategory.backend.totalPoints': 0,
          'skillTracking.skills': [],
          'skillTracking.techStack': [],
          'skillTracking.learningProgress': [],
          'problemHistory': []
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with new scoring fields`);

    // Create indexes for better performance
    await usersCollection.createIndex({ 'stats.totalPoints': -1 });
    await usersCollection.createIndex({ 'stats.averageScore': -1 });
    await usersCollection.createIndex({ 'stats.highestScore': -1 });
    await usersCollection.createIndex({ 'problemHistory.solvedAt': -1 });
    await usersCollection.createIndex({ 'skillTracking.skills.skill': 1 });
    await usersCollection.createIndex({ 'skillTracking.techStack.technology': 1 });

    console.log('Created indexes for user scoring fields');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  addUserScoringFields()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default addUserScoringFields;
