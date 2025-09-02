# User Scoring and Skill Tracking Implementation

## Overview

This implementation adds comprehensive user scoring, learning analytics, and growth guidance to the Zemon platform. Users earn points based on problem-solving performance; the system tracks skills, tech stack, and learning progress, computes patterns (time-of-day, difficulty, category), builds heatmap buckets, calculates role match against a target role, and produces an actionable "Next Up" recommendation.

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
 - Daily heatmap buckets (points and problems per day)
 - Learning patterns (time of day, difficulty, category performance)
 - Role match (% and skill gaps) for the active career goal
 - Lightweight activity log for analytics

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

#### New Growth & Analytics Fields
```typescript
activeGoal?: {
  role: string;            // dynamic role name (e.g., "Full-Stack Developer")
  title?: string;          // optional friendly display title
  focusSkills?: string[];  // prioritized skills for recommendations
  startedAt?: Date;
  targetDate?: Date;
};

goalsHistory?: Array<{
  role: string;
  title?: string;
  achievedAt?: Date;
  outcome?: 'completed' | 'abandoned' | 'switched';
}>;

activityLog?: Array<{
  type: 'problem_solved' | 'resource_viewed' | 'bookmark_added' | 'streak_visit' | 'hackathon_submission';
  points?: number;
  category?: string;
  occurredAt: Date;
  meta?: Record<string, any>;
}>;

dailyStats?: Array<{
  date: string;          // YYYY-MM-DD in user tz
  points: number;
  problemsSolved: number;
}>;

learningPatterns?: {
  timeOfDayPerformance?: { morning?: number; afternoon?: number; evening?: number; night?: number };
  difficultyPerformance?: { easy?: number; medium?: number; hard?: number; expert?: number };
  categoryPerformance?: Record<string, number>; // avg score per category
};

roleMatch?: {
  targetRole?: string;
  matchPercent?: number; // 0-100
  gaps?: Array<{ skill: string; requiredLevel: number; currentLevel: number }>;
  lastComputedAt?: Date;
};

comparisons?: {
  communityPercentile?: number; // 0-100 by totalPoints
  cohort?: string;              // optional cohort label
  lastComputedAt?: Date;
};
```

#### Indexes
```text
problemHistory.solvedAt (asc)
stats.totalPoints (desc)
dailyStats.date (asc)
```

## Implementation Files

### 1. Models
- **`user.model.ts`**: Updated with scoring, skill tracking, growth & analytics fields (activeGoal, goalsHistory, activityLog, dailyStats, learningPatterns, roleMatch, comparisons) + indexes

### 2. Services
- **`userScoring.service.ts`**: Core scoring, analytics, and recommendations
  - `calculatePoints()` → score × difficulty multipliers
  - `extractSkillsFromProblem()` → maps tags/category to skills/tech/topics
  - `updateUserScoring()` → updates stats, categories/difficulties, problemHistory; logs activity; upserts `dailyStats`
  - `getUserSkillSummary()` → returns scoring + skill tracking + analytics surfaces
  - `recomputeLearningPatterns(userId)` → aggregates time-of-day/difficulty/category averages
  - `rebuildDailyStatsFromHistory(userId)` → builds heatmap `dailyStats` from `problemHistory`
  - `recomputeRoleMatch(userId, targetRole?)` → computes role match% and gaps
  - `getDashboardSummary(userId)` → compact hero/overview payload
  - `getUserInsights(userId)` → deep analytics payload (patterns, breakdowns)
  - `getNextUpRecommendation(userId)` → prioritizes: streak risk → goal gap → near milestone → bookmarks → explore

### 3. Controllers
- **`user.controller.ts`**
  - `getUserScoringController` (unchanged response, enhanced data)
  - `getUserDashboardController` (compact dashboard summary)
  - `getUserInsightsController` (deep analytics: patterns, breakdowns, comparisons)
  - `getNextUpController` (single recommendation card for the hero section)
  - `recomputeUserAnalyticsController` (recompute patterns + roleMatch + dailyStats)
  - `setActiveGoalController` (set/update `activeGoal`, then recompute `roleMatch`)
- **`crucible.controller.ts`**: unchanged; scoring flow already integrated

### 4. Routes
- **`user.routes.ts`**
  - `GET  /api/users/me/scoring`
  - `GET  /api/users/me/dashboard`
  - `GET  /api/users/me/insights`
  - `GET  /api/users/me/next-up`
  - `POST /api/users/me/recompute-analytics`
  - `POST /api/users/me/goal`

### 5. Database
- Existing migrations + scripts
- **`populate-user-scoring-data.ts`**: Populates scoring/skills from historical analyses
- NEW SCRIPT: **`backfill-user-analytics.ts`**
  - Recomputes `dailyStats`, `learningPatterns`, and `roleMatch` for all users

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

### Get Dashboard Summary
```
GET /api/users/me/dashboard
```

Response (example):
```json
{
  "success": true,
  "message": "Dashboard summary fetched",
  "data": {
    "totalPoints": 1250,
    "averageScore": 78,
    "highestScore": 95,
    "skills": [{ "skill": "Frontend Development", "averageScore": 82, "problemsSolved": 14 }],
    "dailyStats": [{ "date": "2025-09-01", "points": 34, "problemsSolved": 2 }],
    "roleMatch": { "targetRole": "Full-Stack Developer", "matchPercent": 72, "gaps": [{"skill":"DevOps","requiredLevel":70,"currentLevel":45}] },
    "activeGoal": { "role": "Full-Stack Developer", "focusSkills": ["Backend Development","DevOps"] }
  }
}
```

### Get Insights (Deep Analytics)
```
GET /api/users/me/insights
```

Response (example):
```json
{
  "success": true,
  "message": "User insights fetched",
  "data": {
    "totals": { "points": 1250, "averageScore": 78, "highestScore": 95, "problemsSolved": 42 },
    "problemsByDifficulty": { "easy": {"solved": 12, "averageScore": 80, "totalPoints": 120 }, "medium": { ... } },
    "problemsByCategory": { "algorithms": { ... }, "web-development": { ... }, ... },
    "dailyStats": [{ "date": "2025-09-01", "points": 34, "problemsSolved": 2 }],
    "learningPatterns": {
      "timeOfDayPerformance": { "morning": 82, "evening": 74 },
      "difficultyPerformance": { "easy": 85, "hard": 69 },
      "categoryPerformance": { "system-design": 65, "devops": 48 }
    },
    "roleMatch": { "targetRole": "Full-Stack Developer", "matchPercent": 72, "gaps": [{"skill":"DevOps","requiredLevel":70,"currentLevel":45}] },
    "comparisons": { "communityPercentile": 68 },
    "activeGoal": { "role": "Full-Stack Developer" }
  }
}
```

### Get Next-Up Recommendation
```
GET /api/users/me/next-up
```

Response (examples):
```json
{ "success": true, "message": "Next-up recommendation fetched", "data": {
  "type": "streak",
  "title": "Keep your 11-day streak alive!",
  "description": "Solve one quick problem to maintain your momentum.",
  "tags": ["Algorithms","beginner","~10 mins"],
  "action": { "kind": "solve_problem", "difficulty": "easy", "category": "algorithms" }
}}
```

```json
{ "success": true, "message": "Next-up recommendation fetched", "data": {
  "type": "goal_gap",
  "title": "Boost DevOps towards your goal",
  "description": "You're at 45% in DevOps. Aim for 70% with one targeted challenge.",
  "tags": ["DevOps","medium","~20 mins"],
  "action": { "kind": "solve_problem", "difficulty": "medium", "category": "web-development" }
}}
```

### Recompute Analytics (current user)
```
POST /api/users/me/recompute-analytics
```

Effect:
- Rebuilds `dailyStats` from `problemHistory`
- Recomputes `learningPatterns`
- Recomputes `roleMatch` (uses `activeGoal.role` or a default)

### Set/Update Active Goal
```
POST /api/users/me/goal
Body: { "role": "Full-Stack Developer", "title?": "My Goal", "focusSkills?": ["Backend Development"], "targetDate?": "2025-12-31" }
```

Effect:
- Sets `activeGoal`
- Recomputes `roleMatch` against the new role

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
6. Activity log and daily heatmap buckets are updated immediately
7. Batch/backfill scripts can rebuild analytics from historical data

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
6. **Community Comparisons**: Cohort-based comparisons with opt-outs
7. **Adaptive Role Matrix**: Dynamic role-to-skill weighting powered by observed outcomes

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

### 3. Backfill Analytics (dailyStats, patterns, roleMatch)
```bash
cd backend
ts-node src/scripts/backfill-user-analytics.ts
```

### 4. Test API
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users/me/scoring
```

Additional:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/me/dashboard
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/me/insights
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/me/next-up
curl -H "Authorization: Bearer <token>" -X POST http://localhost:3000/api/users/me/recompute-analytics
curl -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' -d '{"role":"Full-Stack Developer","focusSkills":["DevOps","Backend Development"]}' http://localhost:3000/api/users/me/goal
```

## Benefits

1. **Motivation**: Points system encourages continued problem solving
2. **Skill Visibility**: Users can see their progress in specific areas
3. **Learning Tracking**: Detailed history of what they've learned
4. **Gamification**: Competitive elements through scoring
5. **Personalization**: Future features can use this data for recommendations

This implementation provides a solid foundation for advanced learning analytics and personalized user experiences on the Zemon platform.

---

## Frontend Integration Guide (Detailed)

### Hooks / Calls
- Scoring data (existing):
  - `GET /api/users/me/scoring` → used by `useUserScoring`
- Dashboard overview (hero + compact stats):
  - `GET /api/users/me/dashboard`
- Deep insights (charts, patterns, heatmap):
  - `GET /api/users/me/insights`
- Today’s Focus (hero next-up card):
  - `GET /api/users/me/next-up`
- Goal management:
  - `POST /api/users/me/goal`
- Optional refresh:
  - `POST /api/users/me/recompute-analytics`

### Suggested UI Data Bindings
- Hero section (Today’s Focus): use `/me/next-up` for the card (title, description, tags, action)
- Growth Compass (Radar): compute axes from `problemsByCategory` or distilled categories in `skills`
- Focus Areas: choose 2–3 lowest `skills` or goal `focusSkills` with low `averageScore`
- Momentum & Milestones:
  - Activity heatmap: `dailyStats` (date, points, problemsSolved)
  - Achievements: existing `AchievementBadgesCard` logic + points milestones
- Insights Center:
  - Time-of-day, difficulty, category charts: `learningPatterns`
  - Category/difficulty breakdowns: `problemsByCategory`, `problemsByDifficulty`
  - Role match gauge + gaps table: `roleMatch`

### Caching & Frequency
- Score/scoring/insights endpoints can be cached client-side for 3–5 minutes
- `next-up` can be fetched on page load and when the user completes an action

### Error Handling
- Preserve prior data if a call fails; display inline fallback messages
- For `recompute-analytics`, show a spinner and refresh insights after success

### Progressive Enhancement
- Start with points, averages, heatmap, patterns, and role match
- Add peer comparisons and adaptive recommendations later without breaking API
