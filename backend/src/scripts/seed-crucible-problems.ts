import mongoose from 'mongoose';
import env from '../config/env';
import { CrucibleProblem, User } from '../models';

// Create a dummy user ID
const DUMMY_USER_ID = new mongoose.Types.ObjectId('507f1f77bcf86cd799439001');

const dummyUser = {
  _id: DUMMY_USER_ID,
  clerkId: 'dummy_clerk_id',
  email: 'dummy@example.com',
  fullName: 'Dummy User',
  interests: ['programming', 'system design', 'algorithms'],
  stats: {
    problemsSolved: 0,
    resourcesCreated: 0,
    reputation: 0
  }
};

const dummyProblems = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Design a URL Shortener (like bit.ly)',
    description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
    requirements: {
      functional: [
        'Design a system to shorten long URLs',
        'Handle redirects efficiently',
        'Track basic analytics (clicks, referrers)'
      ],
      nonFunctional: [
        'Ensure high availability and scalability'
      ]
    },
    constraints: [
      'URLs must be unique',
      'Shortened URLs should be as short as possible',
      'System should handle high traffic',
      'Analytics should be real-time'
    ],
    expectedOutcome: 'A scalable URL shortening service with analytics capabilities',
    hints: [
      'Consider using a hash function for URL generation',
      'Think about caching strategies',
      'Plan for database sharding'
    ],
    difficulty: 'easy',
    tags: ['database', 'api', 'scaling', 'backend'],
    createdBy: DUMMY_USER_ID,
    metrics: {
      attempts: 0,
      solutions: 0,
      successRate: 0
    },
    estimatedTime: 120, // minutes
    learningObjectives: [
      'Learn about hash functions',
      'Understand scaling strategies',
      'Implement efficient redirects'
    ]
  },
  {
    _id: '507f1f77bcf86cd799439012',
    title: 'Real-Time Chat System',
    description: 'Design a real-time chat application supporting 1:1 and group messaging, typing indicators, and message history. Discuss WebSocket usage and data storage.',
    requirements: {
      functional: [
        'Support 1:1 and group messaging',
        'Show typing indicators',
        'Store message history'
      ],
      nonFunctional: [
        'Support online/offline status'
      ]
    },
    constraints: [
      'Messages must be delivered in real-time',
      'System must scale to millions of users',
      'Message history should be searchable',
      'Support offline message delivery'
    ],
    expectedOutcome: 'A real-time chat system with robust message delivery guarantees',
    hints: [
      'Consider WebSocket for real-time communication',
      'Think about message delivery guarantees',
      'Plan for message persistence'
    ],
    difficulty: 'medium',
    tags: ['realtime', 'api', 'scaling', 'frontend', 'backend'],
    createdBy: DUMMY_USER_ID,
    metrics: {
      attempts: 0,
      solutions: 0,
      successRate: 0
    },
    estimatedTime: 180, // minutes
    learningObjectives: [
      'Learn about WebSockets',
      'Understand real-time data flow',
      'Implement efficient data storage for messages'
    ]
  },
  {
    _id: '507f1f77bcf86cd799439013',
    title: 'Distributed Rate Limiter',
    description: 'Implement a distributed rate limiter for an API gateway. Discuss algorithms (token bucket, leaky bucket), storage (Redis), and consistency.',
    requirements: {
      functional: [
        'Limit requests per user/IP',
        'Support distributed deployment',
        'Configurable rate limits'
      ],
      nonFunctional: [
        'Minimal performance impact'
      ]
    },
    constraints: [
      'Must work across multiple API servers',
      'Should handle server failures gracefully',
      'Low latency overhead (<10ms)',
      'Support different rate limit policies'
    ],
    expectedOutcome: 'A distributed rate limiting system that maintains consistency across multiple servers',
    hints: [
      'Consider token bucket or leaky bucket algorithms',
      'Think about using Redis for shared state',
      'Plan for clock synchronization issues'
    ],
    difficulty: 'hard',
    tags: ['api', 'scaling', 'backend', 'security'],
    createdBy: DUMMY_USER_ID,
    metrics: {
      attempts: 0,
      solutions: 0,
      successRate: 0
    },
    estimatedTime: 240, // minutes
    learningObjectives: [
      'Learn about rate limiting algorithms',
      'Understand distributed systems challenges',
      'Implement efficient shared state management'
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create dummy user if it doesn't exist
    const existingUser = await User.findById(DUMMY_USER_ID);
    if (!existingUser) {
      await User.create(dummyUser);
      console.log('Created dummy user');
    } else {
      console.log('Dummy user already exists');
    }

    // Clear existing problems with these IDs
    const idsToDelete = dummyProblems.map(problem => problem._id);
    await CrucibleProblem.deleteMany({ _id: { $in: idsToDelete } });
    console.log('Cleared existing problems with the same IDs');

    // Insert dummy problems
    for (const problem of dummyProblems) {
      await CrucibleProblem.create(problem);
      console.log(`Created problem: ${problem.title}`);
    }

    console.log('Database seeded successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 