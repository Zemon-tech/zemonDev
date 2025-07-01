# ZEMON Backend Documentation

## Overview
The ZEMON platform backend is built using Node.js, Express.js, MongoDB, and Redis. It provides a robust API for managing users, colleges, coding problems (Crucible), solutions, and educational resources (Forge).

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: Clerk
- **Real-time**: Socket.IO
- **Validation**: Zod

## Core Features
1. User Management & Authentication
2. College Management
3. The Crucible (Problem-Solution Platform)
4. The Forge (Educational Resources)
5. Real-time Notifications
6. AI-powered Solution Analysis

## Database Models

### 1. User Model
```javascript
{
  clerkId: String,          // External auth ID
  email: String,            // Primary email
  fullName: String,         // User's full name
  collegeId: ObjectId,      // Reference to College
  profile: {
    headline: String,       // Optional headline
    bio: String,           // Optional bio
  },
  branch: String,          // Engineering branch
  year: Number,            // Academic year (1-5)
  interests: [String],     // Array of interests
  stats: {
    problemsSolved: Number,
    resourcesCreated: Number,
    reputation: Number
  },
  bookmarkedResources: [ObjectId], // References to ForgeResource
  completedSolutions: [ObjectId],  // References to CrucibleSolution
  createdAt: Date,
  updatedAt: Date
}
```

### 2. College Model
```javascript
{
  name: String,            // Full college name
  shortName: String,       // Abbreviated name
  university: String,      // Parent university
  location: {
    city: String,
    state: String,
    country: String
  },
  website: String,         // Optional website URL
  domains: [String],       // Valid email domains
  isVerified: Boolean,     // Verification status
  studentCount: Number,    // Total students
  createdAt: Date,
  updatedAt: Date
}
```

### 3. CrucibleProblem Model
```javascript
{
  title: String,
  description: String,
  difficulty: Enum['easy', 'medium', 'hard', 'expert'],
  tags: [String],
  requirements: {
    functional: [String],
    nonFunctional: [String]
  },
  constraints: [String],
  expectedOutcome: String,
  hints: [String],
  createdBy: ObjectId,     // Reference to User
  metrics: {
    attempts: Number,
    solutions: Number,
    successRate: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4. CrucibleSolution Model
```javascript
{
  problemId: ObjectId,     // Reference to CrucibleProblem
  userId: ObjectId,        // Reference to User
  content: String,         // Solution code/content
  status: Enum['draft', 'submitted', 'reviewed'],
  aiAnalysis: {
    score: Number,
    feedback: String,
    suggestions: [String]
  },
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  metrics: {
    upvotes: Number,
    downvotes: Number,
    views: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. ForgeResource Model
```javascript
{
  title: String,
  type: Enum['article', 'video', 'book', 'course', 'tool', 'repository', 'documentation'],
  url: String,
  description: String,
  content: String,         // Optional content for articles
  tags: [String],
  difficulty: Enum['beginner', 'intermediate', 'advanced'],
  createdBy: ObjectId,     // Reference to User
  reviews: [{
    userId: ObjectId,
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  metrics: {
    views: Number,
    bookmarks: Number,
    rating: Number         // Average rating
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Authentication
All protected routes require a valid Clerk JWT token in the Authorization header.

### User Routes
```
GET    /api/users/me              - Get current user profile
PATCH  /api/users/me             - Update current user profile
GET    /api/users/profile/:id    - Get public profile
POST   /api/users/webhook        - Handle Clerk webhook
GET    /api/users/solutions/:id  - Get user's solutions
GET    /api/users/me/bookmarks   - Get user's bookmarked resources
```

### College Routes
```
GET    /api/colleges             - Get all colleges (paginated)
GET    /api/colleges/search      - Search colleges
GET    /api/colleges/:id         - Get college by ID
POST   /api/colleges            - Create college (admin)
PATCH  /api/colleges/:id        - Update college (admin)
DELETE /api/colleges/:id        - Delete college (admin)
POST   /api/colleges/:id/verify - Verify college (admin)
```

### Problem Routes (Crucible)
```
GET    /api/problems            - Get all problems (paginated)
GET    /api/problems/search     - Search problems
GET    /api/problems/:id        - Get problem by ID
GET    /api/problems/:id/stats  - Get problem statistics
POST   /api/problems           - Create problem (admin)
PATCH  /api/problems/:id       - Update problem (admin)
DELETE /api/problems/:id       - Delete problem (admin)
```

### Solution Routes (Crucible)
```
GET    /api/solutions/problem/:id  - Get solutions for problem
GET    /api/solutions/:id         - Get solution by ID
POST   /api/solutions/problem/:id - Submit solution
PATCH  /api/solutions/:id        - Update solution
DELETE /api/solutions/:id        - Delete solution
POST   /api/solutions/:id/review - Review solution
GET    /api/solutions/user/me    - Get user's solutions
```

### Resource Routes (Forge)
```
GET    /api/resources           - Get all resources (paginated)
GET    /api/resources/search    - Search resources
GET    /api/resources/:id       - Get resource by ID
POST   /api/resources          - Create resource
PATCH  /api/resources/:id      - Update resource
DELETE /api/resources/:id      - Delete resource
POST   /api/resources/:id/review  - Review resource
POST   /api/resources/:id/bookmark - Toggle bookmark
GET    /api/resources/user/me   - Get user's resources
```

## Middleware

### Authentication Middleware
- `requireAuth`: Validates Clerk JWT token
- `requireAdmin`: Ensures user has admin privileges
- `verifyWebhookSignature`: Validates Clerk webhook signatures

### Validation Middleware
- `validateBody`: Validates request body using Zod schemas
- `validateQuery`: Validates query parameters using Zod schemas

### Rate Limiting
- Global API rate limiting
- Stricter limits for authentication endpoints
- Webhook rate limiting

### Error Handling
- Centralized error handling middleware
- Standardized error responses
- Detailed logging with Winston

## Real-time Features
Socket.IO is used for real-time features:
- Solution submission notifications
- Review notifications
- Resource updates
- System announcements

## AI Integration
The solution analysis service:
1. Analyzes submitted solutions
2. Provides code quality feedback
3. Suggests improvements
4. Calculates solution score

## Data Validation
Zod schemas ensure data integrity for:
- User profiles
- College information
- Problems and solutions
- Educational resources
- Search queries
- Reviews and ratings

## Security Features
1. JWT-based authentication
2. Rate limiting
3. CORS protection
4. Helmet security headers
5. Input validation
6. MongoDB injection prevention
7. Webhook signature verification

## Error Handling
Standardized error responses:
```javascript
{
  error: String,           // Error message
  details?: any,           // Optional details
  stack?: String          // Stack trace (development only)
}
```

## Metrics and Monitoring
- Winston logging
- Request logging
- Error tracking
- Performance monitoring
- Database query monitoring

## Environment Variables
Required environment variables:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/zemon
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=development
```

## Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start MongoDB and Redis
4. Run development server: `npm run dev`

## Production Considerations
1. Set appropriate environment variables
2. Configure PM2 or similar process manager
3. Set up monitoring and logging
4. Configure proper security measures
5. Set up backup strategy
6. Configure proper CORS settings
7. Set up SSL/TLS
8. Configure proper rate limiting 