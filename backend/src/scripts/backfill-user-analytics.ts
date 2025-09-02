import mongoose from 'mongoose';
import env from '../config/env';
import User from '../models/user.model';
import { rebuildDailyStatsFromHistory, recomputeLearningPatterns, recomputeRoleMatch } from '../services/userScoring.service';

async function backfillUserAnalytics() {
  await mongoose.connect(env.MONGO_URI);
  const cursor = User.find({}, { _id: 1 }).cursor();
  let processed = 0;
  for await (const u of cursor) {
    try {
      const userId = u._id as any;
      await rebuildDailyStatsFromHistory(userId);
      await recomputeLearningPatterns(userId);
      await recomputeRoleMatch(userId);
      processed++;
      if (processed % 50 === 0) console.log(`Processed ${processed} users...`);
    } catch (e) {
      console.error('Backfill failed for user', u._id, e);
    }
  }
  await mongoose.disconnect();
  console.log('Backfill completed. Users processed:', processed);
}

if (require.main === module) {
  backfillUserAnalytics().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default backfillUserAnalytics;

