import mongoose from 'mongoose';
import { SolutionDraft } from '../models';
import env from '../config/env';
import { logger } from '../utils/logger';

/**
 * Migration script to remove version history from SolutionDraft documents
 * This script:
 * 1. Finds all SolutionDraft documents that have a 'versions' field
 * 2. Removes the 'versions' field from these documents
 * 3. Provides detailed statistics and logging
 * 
 * SAFETY MEASURES:
 * - Only removes the 'versions' field, preserves all other data
 * - Provides detailed logging of what's being modified
 * - Shows statistics before and after the migration
 * - Can be run multiple times safely (idempotent)
 */
async function removeVersionHistory() {
  try {
    // Connect to the database
    logger.info(`Connecting to MongoDB at ${env.MONGO_URI}...`);
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');

    // Get total count of SolutionDraft documents
    const totalDrafts = await SolutionDraft.countDocuments();
    logger.info(`Total SolutionDraft documents in database: ${totalDrafts}`);

    // Find documents that have a 'versions' field
    const draftsWithVersions = await SolutionDraft.find({
      versions: { $exists: true }
    });

    logger.info(`Found ${draftsWithVersions.length} documents with version history`);

    if (draftsWithVersions.length === 0) {
      logger.info('No documents with version history found. Migration not needed.');
      return;
    }

    // Show sample of documents that will be modified
    logger.info('Sample documents that will be modified:');
    draftsWithVersions.slice(0, 3).forEach((draft, index) => {
      logger.info(`Document ${index + 1}:`);
      logger.info(`  - ID: ${draft._id}`);
      logger.info(`  - User ID: ${draft.userId}`);
      logger.info(`  - Problem ID: ${draft.problemId}`);
      logger.info(`  - Versions count: ${(draft as any).versions?.length || 0}`);
      logger.info(`  - Current content length: ${draft.currentContent?.length || 0} characters`);
    });

    // Remove the 'versions' field from all documents that have it
    const updateResult = await SolutionDraft.updateMany(
      { versions: { $exists: true } },
      { $unset: { versions: "" } }
    );

    logger.info(`Migration completed successfully!`);
    logger.info(`Modified ${updateResult.modifiedCount} documents`);
    logger.info(`Matched ${updateResult.matchedCount} documents`);

    // Force a database refresh by waiting a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify the migration by checking if any documents still have versions
    const remainingDraftsWithVersions = await SolutionDraft.countDocuments({
      versions: { $exists: true }
    });

    if (remainingDraftsWithVersions === 0) {
      logger.info('✅ Verification successful: No documents with version history remain');
    } else {
      logger.warn(`⚠️  Warning: ${remainingDraftsWithVersions} documents still have version history`);
      
      // Try a more aggressive approach if the first attempt didn't work
      logger.info('Attempting more aggressive version removal...');
      const aggressiveUpdateResult = await SolutionDraft.updateMany(
        {},
        { $unset: { versions: "" } }
      );
      
      logger.info(`Aggressive update: Modified ${aggressiveUpdateResult.modifiedCount} documents`);
      
      // Check again after aggressive update
      const finalCheck = await SolutionDraft.countDocuments({
        versions: { $exists: true }
      });
      
      if (finalCheck === 0) {
        logger.info('✅ Aggressive removal successful: No documents with version history remain');
      } else {
        logger.warn(`⚠️  Still ${finalCheck} documents have version history after aggressive removal`);
      }
    }

    // Show final statistics
    const finalTotalDrafts = await SolutionDraft.countDocuments();
    logger.info(`Final statistics:`);
    logger.info(`  - Total SolutionDraft documents: ${finalTotalDrafts}`);
    logger.info(`  - Documents with version history: ${remainingDraftsWithVersions}`);
    logger.info(`  - Documents cleaned: ${updateResult.modifiedCount}`);

    // Show sample of cleaned documents
    const sampleCleanedDrafts = await SolutionDraft.find().limit(3);
    logger.info('Sample documents after migration:');
    sampleCleanedDrafts.forEach((draft, index) => {
      logger.info(`Document ${index + 1}:`);
      logger.info(`  - ID: ${draft._id}`);
      logger.info(`  - User ID: ${draft.userId}`);
      logger.info(`  - Problem ID: ${draft.problemId}`);
      logger.info(`  - Has versions field: ${(draft as any).versions ? 'YES' : 'NO'}`);
      logger.info(`  - Current content length: ${draft.currentContent?.length || 0} characters`);
      logger.info(`  - Status: ${draft.status}`);
      logger.info(`  - Last edited: ${draft.lastEdited}`);
    });

    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the migration
removeVersionHistory(); 