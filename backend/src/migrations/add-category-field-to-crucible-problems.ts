import mongoose from 'mongoose';
import env from '../config/env';

// Migration to add category field to existing CrucibleProblem documents
async function migrateCrucibleProblems() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the CrucibleProblem collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('crucibleproblems');

    // Find all problems that don't have a category field
    const problemsWithoutCategory = await collection.find({
      $or: [
        { category: { $exists: false } },
        { category: null }
      ]
    }).toArray();

    console.log(`Found ${problemsWithoutCategory.length} problems without category field`);

    // Update each problem with appropriate category based on tags and content
    for (const problem of problemsWithoutCategory) {
      let category = 'algorithms'; // default category
      
      // Determine category based on tags and title
      const tags = problem.tags || [];
      const title = problem.title || '';
      const description = problem.description || '';
      
      if (tags.includes('database') || tags.includes('scaling') || tags.includes('architecture')) {
        category = 'system-design';
      } else if (tags.includes('api') || tags.includes('backend') || tags.includes('server')) {
        category = 'backend';
      } else if (tags.includes('frontend') || tags.includes('ui') || tags.includes('react')) {
        category = 'frontend';
      } else if (tags.includes('mobile') || tags.includes('ios') || tags.includes('android')) {
        category = 'mobile-development';
      } else if (tags.includes('data') || tags.includes('ml') || tags.includes('ai')) {
        category = 'data-science';
      } else if (tags.includes('devops') || tags.includes('deployment') || tags.includes('ci-cd')) {
        category = 'devops';
      } else if (tags.includes('web') || tags.includes('html') || tags.includes('css')) {
        category = 'web-development';
      }

      // Update the problem with the category field
      await collection.updateOne(
        { _id: problem._id },
        { $set: { category: category } }
      );
      
      console.log(`Updated problem "${problem.title}" with category: ${category}`);
    }

    console.log('Migration completed successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCrucibleProblems();
}

export default migrateCrucibleProblems;
