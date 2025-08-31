# User Scoring and Skill Tracking Implementation

## Overview

This implementation adds comprehensive user scoring and skill tracking to the Zemon platform. Users now earn points based on their problem-solving performance, and the system tracks their skills, tech stack, and learning progress based on the problems they solve.

## Key Features

### 1. Points System
- **Base Points**: 10 (easy), 20 (medium), 30 (hard), 40 (expert)
- **Difficulty Multipliers**: 1x (easy), 2x (medium), 3x (hard), 4x (expert)
- **Score Multiplier**: 0-100 score becomes 0.1-1.0 multiplier
- **Final Points**: Base × Difficulty × Score Multiplier (minimum 1 point)

### 2. Skill Tracking
The system automatically tracks:
- **Skills**: Programming languages, algorithms, system design, etc.
- **Tech Stack**: Frameworks, libraries, databases, cloud services
- **Learning Progress**: Topics and concepts based on problem tags

### 3. Progress Analytics
- Total points earned
- Average score across all problems
- Highest score achieved
- Problems solved by difficulty level
- Problems solved by category
- Detailed problem-solving history

## Database Schema Changes

### User Model Updates

#### New Stats Fields
```typescript
stats: {
  // Existing fields...
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  problemsByDifficulty: {
    easy: { solved: number; averageScore: number; totalPoints: number };
    medium: { solved: number; averageScore: number; totalPoints: number };
    hard: { solved: number; averageScore: number; totalPoints: number };
    expert: { solved: number; averageScore: number; totalPoints: number };
  };
  problemsByCategory: {
    algorithms: { solved: number; averageScore: number; totalPoints: number };
    'system-design': { solved: number; averageScore: number; totalPoints: number };
    // ... other categories
  };
}
```

#### New Skill Tracking Fields
```typescript
skillTracking: {
  skills: Array<{
    skill: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    progress: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastSolvedAt?: Date;
    lastUpdated: Date;
  }>;
  techStack: Array<{
    technology: string;
    category: string;
    proficiency: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastUsedAt?: Date;
    lastUpdated: Date;
  }>;
  learningProgress: Array<{
    topic: string;
    category: string;
    mastery: number;
    problemsSolved: number;
    totalPoints: number;
    averageScore: number;
    lastStudiedAt?: Date;
    lastUpdated: Date;
  }>;
}
```

#### Problem History
```typescript
problemHistory: Array<{
  problemId: ObjectId;
  analysisId: ObjectId;
  score: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  solvedAt: Date;
  reattempts: number;
}>;
```

## Implementation Files

### 1. Models
- **`user.model.ts`**: Updated with new scoring and skill tracking fields

### 2. Services
- **`userScoring.service.ts`**: Core scoring and skill tracking logic
  - `calculatePoints()`: Calculate points based on score and difficulty
  - `extractSkillsFromProblem()`: Extract skills from problem tags/category
  - `updateUserScoring()`: Update user scoring and skill tracking
  - `getUserSkillSummary()`: Get user's skill summary

### 3. Controllers
- **`user.controller.ts`**: Added `getUserScoringController()` endpoint
- **`crucible.controller.ts`**: Updated solution analysis to include scoring

### 4. Routes
- **`user.routes.ts`**: Added `/api/users/me/scoring` endpoint

### 5. Database
- **`add-user-scoring-fields.ts`**: Migration to add new fields
- **`populate-user-scoring-data.ts`**: Script to populate existing data

## API Endpoints

### Get User Scoring Data
```
GET /api/users/me/scoring
```

**Response:**
```json
{
  "success": true,
  "message": "User scoring data retrieved successfully",
  "data": {
    "totalPoints": 1250,
    "averageScore": 78,
    "highestScore": 95,
    "skills": [...],
    "techStack": [...],
    "learningProgress": [...],
    "problemsByDifficulty": {...},
    "problemsByCategory": {...}
  }
}
```

## Skill Mapping

The system automatically maps problem tags and categories to skills:

### Programming Languages
- javascript → JavaScript
- python → Python
- java → Java
- typescript → TypeScript
- etc.

### Frameworks & Libraries
- react → React
- vue → Vue.js
- nodejs → Node.js
- express → Express.js
- etc.

### Databases
- mongodb → MongoDB
- postgresql → PostgreSQL
- mysql → MySQL
- redis → Redis

### Cloud & DevOps
- aws → AWS
- docker → Docker
- kubernetes → Kubernetes
- terraform → Terraform

### Algorithms & Data Structures
- algorithms → Algorithms
- data-structures → Data Structures
- dynamic-programming → Dynamic Programming
- etc.

## Integration Points

### Solution Analysis Flow
1. User submits solution for analysis
2. AI generates comprehensive analysis with score (0-100)
3. `createSolutionAnalysisAndUpdateProgress()` is called
4. `updateUserScoring()` calculates points and updates skills
5. User's scoring data is updated in real-time

### Points Calculation Example
- **Problem**: Medium difficulty algorithm problem
- **Score**: 85/100
- **Points**: 20 (base) × 2 (medium multiplier) × 0.85 (score multiplier) = 34 points

## Future Enhancements

1. **Skill Level Determination**: Automatically determine skill levels based on performance
2. **Learning Paths**: Suggest problems based on skill gaps
3. **Achievements**: Badges and milestones based on scoring milestones
4. **Leaderboards**: Compare users based on points and skills
5. **Skill Recommendations**: Suggest learning resources based on weak areas

## Usage Instructions

### 1. Run Migration
```bash
cd backend
npm run migrate:add-user-scoring-fields
```

### 2. Populate Existing Data
```bash
cd backend
npm run script:populate-user-scoring-data
```

### 3. Test API
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users/me/scoring
```

## Benefits

1. **Motivation**: Points system encourages continued problem solving
2. **Skill Visibility**: Users can see their progress in specific areas
3. **Learning Tracking**: Detailed history of what they've learned
4. **Gamification**: Competitive elements through scoring
5. **Personalization**: Future features can use this data for recommendations

This implementation provides a solid foundation for advanced learning analytics and personalized user experiences on the Zemon platform.
