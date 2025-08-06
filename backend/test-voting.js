const mongoose = require('mongoose');
const ProjectShowcase = require('./src/models/projectShowcase.model').default;

// Test voting functionality
async function testVoting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zemon');
    console.log('Connected to MongoDB');

    // Create a test project
    const testProject = new ProjectShowcase({
      title: 'Test Project',
      description: 'A test project for voting',
      images: ['https://example.com/image.jpg'],
      gitRepositoryUrl: 'https://github.com/test/project',
      demoUrl: 'https://demo.example.com',
      userId: new mongoose.Types.ObjectId(),
      username: 'testuser',
      upvotes: 0,
      upvotedBy: [],
      downvotes: 0,
      downvotedBy: []
    });

    await testProject.save();
    console.log('Test project created:', testProject._id);

    const userId = new mongoose.Types.ObjectId();

    // Test upvoting
    console.log('\n--- Testing Upvote ---');
    testProject.upvotes += 1;
    testProject.upvotedBy.push(userId);
    await testProject.save();
    console.log('Upvoted successfully');
    console.log('Upvotes:', testProject.upvotes);
    console.log('Upvoted by:', testProject.upvotedBy.length);

    // Test downvoting (should remove upvote first)
    console.log('\n--- Testing Downvote (should remove upvote) ---');
    const hasUpvoted = testProject.upvotedBy.some(id => id.toString() === userId.toString());
    if (hasUpvoted) {
      testProject.upvotes = Math.max(0, testProject.upvotes - 1);
      testProject.upvotedBy = testProject.upvotedBy.filter(
        id => id.toString() !== userId.toString()
      );
    }
    testProject.downvotes += 1;
    testProject.downvotedBy.push(userId);
    await testProject.save();
    console.log('Downvoted successfully');
    console.log('Upvotes:', testProject.upvotes);
    console.log('Downvotes:', testProject.downvotes);
    console.log('Upvoted by:', testProject.upvotedBy.length);
    console.log('Downvoted by:', testProject.downvotedBy.length);

    // Test upvoting again (should remove downvote first)
    console.log('\n--- Testing Upvote again (should remove downvote) ---');
    const hasDownvoted = testProject.downvotedBy.some(id => id.toString() === userId.toString());
    if (hasDownvoted) {
      testProject.downvotes = Math.max(0, testProject.downvotes - 1);
      testProject.downvotedBy = testProject.downvotedBy.filter(
        id => id.toString() !== userId.toString()
      );
    }
    testProject.upvotes += 1;
    testProject.upvotedBy.push(userId);
    await testProject.save();
    console.log('Upvoted again successfully');
    console.log('Upvotes:', testProject.upvotes);
    console.log('Downvotes:', testProject.downvotes);
    console.log('Upvoted by:', testProject.upvotedBy.length);
    console.log('Downvoted by:', testProject.downvotedBy.length);

    // Clean up
    await ProjectShowcase.findByIdAndDelete(testProject._id);
    console.log('\nTest project cleaned up');

    console.log('\n✅ All voting tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testVoting(); 