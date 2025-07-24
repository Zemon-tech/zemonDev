import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserChannelStatus } from '../models';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function autoUnbanExpiredUsers() {
  await mongoose.connect(MONGO_URI);
  const now = new Date();
  const expired = await UserChannelStatus.find({
    isBanned: true,
    status: 'banned',
    banExpiresAt: { $lte: now }
  });
  let count = 0;
  for (const doc of expired) {
    doc.isBanned = false;
    doc.banExpiresAt = undefined;
    doc.banReason = undefined;
    doc.bannedBy = undefined;
    doc.status = 'approved';
    await doc.save();
    count++;
  }
  console.log(`Auto-unbanned ${count} users.`);
  await mongoose.disconnect();
}

autoUnbanExpiredUsers().catch(err => {
  console.error('Auto-unban script failed:', err);
  process.exit(1);
}); 