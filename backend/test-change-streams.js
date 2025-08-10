/**
 * Test script for Change Streams service
 * This script tests the real-time notification delivery via MongoDB Change Streams
 * 
 * Usage:
 * 1. Start the backend server with ENABLE_CHANGE_STREAMS=true
 * 2. Run this script: node test-change-streams.js
 * 3. Check the backend logs for Change Streams activity
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zemon');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Create a test notification
async function createTestNotification() {
  try {
    const Notification = mongoose.model('Notification', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      type: String,
      title: String,
      message: String,
      priority: String,
      data: mongoose.Schema.Types.Mixed,
      isRead: Boolean,
      isArchived: Boolean,
      expiresAt: Date,
      createdAt: Date,
      updatedAt: Date
    }));

    const testNotification = new Notification({
      userId: new mongoose.Types.ObjectId(), // Random user ID
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification to verify Change Streams',
      priority: 'medium',
      data: {
        entityId: 'test-123',
        entityType: 'test',
        action: 'created'
      },
      isRead: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedNotification = await testNotification.save();
    console.log('✅ Test notification created:', {
      id: savedNotification._id,
      type: savedNotification.type,
      title: savedNotification.title
    });

    return savedNotification;
  } catch (error) {
    console.error('❌ Failed to create test notification:', error);
    throw error;
  }
}

// Clean up test data
async function cleanupTestData(notificationId) {
  try {
    const Notification = mongoose.model('Notification');
    await Notification.findByIdAndDelete(notificationId);
    console.log('✅ Test notification cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test notification:', error);
  }
}

// Main test function
async function runTest() {
  console.log('🚀 Starting Change Streams test...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    console.log('📝 Creating test notification...');
    const testNotification = await createTestNotification();
    
    console.log('\n⏳ Waiting 5 seconds for Change Streams to process...');
    console.log('💡 Check your backend logs for Change Streams activity');
    console.log('💡 Look for: "Processed notification change" or "Emitted notification to user"');
    
    // Wait for Change Streams to process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await cleanupTestData(testNotification._id);
    
    console.log('\n✅ Test completed!');
    console.log('\n📋 What to verify:');
    console.log('1. Backend logs should show Change Streams initialization');
    console.log('2. Backend logs should show notification processing');
    console.log('3. Socket.IO should emit notification_received event');
    console.log('4. Frontend should receive real-time notification');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the test
runTest();
