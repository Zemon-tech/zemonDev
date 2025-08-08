import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createNirvanaCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Create collections if they don't exist
    const collections = ['nirvanahackathons', 'nirvananews', 'nirvanatools'];
    
    for (const collectionName of collections) {
      const collections = await db.listCollections({ name: collectionName }).toArray();
      
      if (collections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes for better performance
    const nirvanaHackathonCollection = db.collection('nirvanahackathons');
    await nirvanaHackathonCollection.createIndex({ status: 1, priority: 1 });
    await nirvanaHackathonCollection.createIndex({ isPinned: 1, createdAt: -1 });
    await nirvanaHackathonCollection.createIndex({ deadline: 1 });
    await nirvanaHackathonCollection.createIndex({ category: 1 });
    await nirvanaHackathonCollection.createIndex({ tags: 1 });
    console.log('Created indexes for nirvanahackathons collection');

    const nirvanaNewsCollection = db.collection('nirvananews');
    await nirvanaNewsCollection.createIndex({ priority: 1, createdAt: -1 });
    await nirvanaNewsCollection.createIndex({ isPinned: 1, createdAt: -1 });
    await nirvanaNewsCollection.createIndex({ category: 1 });
    await nirvanaNewsCollection.createIndex({ tags: 1 });
    await nirvanaNewsCollection.createIndex({ isVerified: 1 });
    console.log('Created indexes for nirvananews collection');

    const nirvanaToolCollection = db.collection('nirvanatools');
    await nirvanaToolCollection.createIndex({ priority: 1, createdAt: -1 });
    await nirvanaToolCollection.createIndex({ isPinned: 1, createdAt: -1 });
    await nirvanaToolCollection.createIndex({ category: 1 });
    await nirvanaToolCollection.createIndex({ tags: 1 });
    await nirvanaToolCollection.createIndex({ rating: -1 });
    await nirvanaToolCollection.createIndex({ views: -1 });
    await nirvanaToolCollection.createIndex({ isVerified: 1 });
    console.log('Created indexes for nirvanatools collection');

    console.log('✅ Nirvana collections and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating Nirvana collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
createNirvanaCollections();
