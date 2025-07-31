import mongoose from 'mongoose';
import { SolutionDraft } from '../models';
import env from '../config/env';
import { logger } from '../utils/logger';

/**
 * Migration script to fix SolutionDraft indexes
 * This script:
 * 1. Drops the unique index on userId_1_problemId_1 if it exists
 * 2. Ensures non-unique indexes are created
 */
async function fixSolutionDraftIndexes() {
  try {
    // Connect to the database
    logger.info(`Connecting to MongoDB at ${env.MONGO_URI}...`);
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get existing indexes
    const indexes = await SolutionDraft.collection.indexes();
    logger.info('Current indexes:', indexes);

    // Find the unique index if it exists
    const uniqueIndex = indexes.find(
      (idx) => 
        idx.key && 
        idx.key.userId === 1 && 
        idx.key.problemId === 1 && 
        idx.unique === true
    );

    if (uniqueIndex) {
      logger.info(`Found unique index to drop: ${uniqueIndex.name}`);
      
      // Drop the unique index
      await SolutionDraft.collection.dropIndex(uniqueIndex.name || '');
      logger.info('Dropped unique index');
    } else {
      logger.info('No unique index found');
    }

    // Create non-unique indexes
    logger.info('Creating non-unique indexes...');
    await SolutionDraft.collection.createIndex(
      { userId: 1, problemId: 1, status: 1 },
      { background: true }
    );
    await SolutionDraft.collection.createIndex(
      { userId: 1, problemId: 1 },
      { background: true }
    );
    
    logger.info('Indexes after migration:');
    const updatedIndexes = await SolutionDraft.collection.indexes();
    logger.info(JSON.stringify(updatedIndexes, null, 2));

    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the migration
fixSolutionDraftIndexes();