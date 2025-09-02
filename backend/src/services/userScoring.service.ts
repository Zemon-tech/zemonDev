import mongoose, { ClientSession, Types } from 'mongoose';
import User from '../models/user.model';
import { ICrucibleProblem } from '../models/crucibleProblem.model';
import { ISolutionAnalysisResult } from '../models/solutionAnalysis.model';

// Points calculation based on difficulty and score
const DIFFICULTY_MULTIPLIERS = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4
};

// Base points for each difficulty level
const BASE_POINTS = {
  easy: 10,
  medium: 20,
  hard: 30,
  expert: 40
};

// Skill mapping from problem tags and categories
const SKILL_MAPPINGS = {
  // Programming Languages
  'javascript': { skill: 'JavaScript', category: 'programming' },
  'python': { skill: 'Python', category: 'programming' },
  'java': { skill: 'Java', category: 'programming' },
  'cpp': { skill: 'C++', category: 'programming' },
  'csharp': { skill: 'C#', category: 'programming' },
  'go': { skill: 'Go', category: 'programming' },
  'rust': { skill: 'Rust', category: 'programming' },
  'typescript': { skill: 'TypeScript', category: 'programming' },
  
  // Frameworks and Libraries
  'react': { skill: 'React', category: 'frontend' },
  'vue': { skill: 'Vue.js', category: 'frontend' },
  'angular': { skill: 'Angular', category: 'frontend' },
  'nodejs': { skill: 'Node.js', category: 'backend' },
  'express': { skill: 'Express.js', category: 'backend' },
  'django': { skill: 'Django', category: 'backend' },
  'flask': { skill: 'Flask', category: 'backend' },
  'spring': { skill: 'Spring Boot', category: 'backend' },
  'laravel': { skill: 'Laravel', category: 'backend' },
  
  // Databases
  'mongodb': { skill: 'MongoDB', category: 'database' },
  'postgresql': { skill: 'PostgreSQL', category: 'database' },
  'mysql': { skill: 'MySQL', category: 'database' },
  'redis': { skill: 'Redis', category: 'database' },
  
  // Cloud and DevOps
  'aws': { skill: 'AWS', category: 'cloud' },
  'docker': { skill: 'Docker', category: 'devops' },
  'kubernetes': { skill: 'Kubernetes', category: 'devops' },
  'terraform': { skill: 'Terraform', category: 'devops' },
  
  // Algorithms and Data Structures
  'algorithms': { skill: 'Algorithms', category: 'algorithms' },
  'data-structures': { skill: 'Data Structures', category: 'algorithms' },
  'dynamic-programming': { skill: 'Dynamic Programming', category: 'algorithms' },
  'graph-algorithms': { skill: 'Graph Algorithms', category: 'algorithms' },
  'sorting': { skill: 'Sorting Algorithms', category: 'algorithms' },
  'searching': { skill: 'Searching Algorithms', category: 'algorithms' },
  
  // System Design
  'system-design': { skill: 'System Design', category: 'architecture' },
  'microservices': { skill: 'Microservices', category: 'architecture' },
  'api-design': { skill: 'API Design', category: 'architecture' },
  'scalability': { skill: 'Scalability', category: 'architecture' },
  
  // Web Development
  'html': { skill: 'HTML', category: 'frontend' },
  'css': { skill: 'CSS', category: 'frontend' },
  'responsive-design': { skill: 'Responsive Design', category: 'frontend' },
  'web-security': { skill: 'Web Security', category: 'security' },
  
  // Mobile Development
  'react-native': { skill: 'React Native', category: 'mobile' },
  'flutter': { skill: 'Flutter', category: 'mobile' },
  'ios': { skill: 'iOS Development', category: 'mobile' },
  'android': { skill: 'Android Development', category: 'mobile' },
  
  // Data Science
  'machine-learning': { skill: 'Machine Learning', category: 'data-science' },
  'data-analysis': { skill: 'Data Analysis', category: 'data-science' },
  'statistics': { skill: 'Statistics', category: 'data-science' },
  'pandas': { skill: 'Pandas', category: 'data-science' },
  'numpy': { skill: 'NumPy', category: 'data-science' },
  'tensorflow': { skill: 'TensorFlow', category: 'data-science' },
  'pytorch': { skill: 'PyTorch', category: 'data-science' },
};

// Category to skill mapping
const CATEGORY_SKILL_MAPPINGS = {
  'algorithms': { skill: 'Algorithms', category: 'algorithms' },
  'system-design': { skill: 'System Design', category: 'architecture' },
  'web-development': { skill: 'Web Development', category: 'web-development' },
  'mobile-development': { skill: 'Mobile Development', category: 'mobile' },
  'data-science': { skill: 'Data Science', category: 'data-science' },
  'devops': { skill: 'DevOps', category: 'devops' },
  'frontend': { skill: 'Frontend Development', category: 'frontend' },
  'backend': { skill: 'Backend Development', category: 'backend' },
};

export interface CalculatePointsArgs {
  score: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface UpdateUserScoringArgs {
  userId: string | Types.ObjectId;
  problemId: string | Types.ObjectId;
  analysisId: string | Types.ObjectId;
  score: number; // 0-100
  problem: ICrucibleProblem;
  session?: ClientSession;
}

export interface UpdateUserScoringResult {
  points: number;
  totalPoints: number;
  averageScore: number;
  highestScore: number;
  skillsUpdated: string[];
  techStackUpdated: string[];
  learningProgressUpdated: string[];
}

/**
 * Calculate points based on score and difficulty
 */
export function calculatePoints(args: CalculatePointsArgs): number {
  const { score, difficulty } = args;
  
  // Validate inputs
  if (typeof score !== 'number' || score < 0 || score > 100) {
    console.error('Invalid score:', score);
    return 1;
  }
  
  if (!difficulty || !['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
    console.error('Invalid difficulty:', difficulty);
    return 1;
  }
  
  // Base points for the difficulty level
  const basePoints = BASE_POINTS[difficulty];
  
  // Multiplier based on difficulty
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Score multiplier (0-100 score becomes 0.1-1.0 multiplier)
  const scoreMultiplier = score / 100;
  
  // Calculate final points
  const points = Math.round(basePoints * multiplier * scoreMultiplier);
  
  console.log(`Points calculation: ${basePoints} × ${multiplier} × ${scoreMultiplier} = ${points}`);
  
  return Math.max(points, 1); // Minimum 1 point
}

/**
 * Extract skills from problem tags and category
 */
export function extractSkillsFromProblem(problem: ICrucibleProblem): {
  skills: Array<{ skill: string; category: string }>;
  techStack: Array<{ technology: string; category: string }>;
  learningTopics: Array<{ topic: string; category: string }>;
} {
  const skills = new Set<string>();
  const techStack = new Set<string>();
  const learningTopics = new Set<string>();
  
  // Add category-based skill
  const categoryMapping = CATEGORY_SKILL_MAPPINGS[problem.category];
  if (categoryMapping) {
    skills.add(JSON.stringify(categoryMapping));
  }
  
  // Process tags
  problem.tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    const mapping = SKILL_MAPPINGS[lowerTag as keyof typeof SKILL_MAPPINGS];
    
    if (mapping) {
      if (['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'typescript'].includes(lowerTag)) {
        techStack.add(JSON.stringify(mapping));
      } else if (['react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel'].includes(lowerTag)) {
        techStack.add(JSON.stringify(mapping));
      } else if (['mongodb', 'postgresql', 'mysql', 'redis'].includes(lowerTag)) {
        techStack.add(JSON.stringify(mapping));
      } else if (['aws', 'docker', 'kubernetes', 'terraform'].includes(lowerTag)) {
        techStack.add(JSON.stringify(mapping));
      } else {
        skills.add(JSON.stringify(mapping));
      }
    }
  });
  
  // Convert back to objects
  const skillsArray = Array.from(skills).map(s => JSON.parse(s));
  const techStackArray = Array.from(techStack).map(s => JSON.parse(s));
  const learningTopicsArray = Array.from(learningTopics).map(s => JSON.parse(s));
  
  return { skills: skillsArray, techStack: techStackArray, learningTopics: learningTopicsArray };
}

/**
 * Determine skill level based on average score and problems solved
 */
export function determineSkillLevel(averageScore: number, problemsSolved: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (problemsSolved < 3) return 'beginner';
  
  if (averageScore >= 85 && problemsSolved >= 10) return 'expert';
  if (averageScore >= 75 && problemsSolved >= 5) return 'advanced';
  if (averageScore >= 60 && problemsSolved >= 3) return 'intermediate';
  
  return 'beginner';
}

/**
 * Update user scoring and skill tracking
 */
export async function updateUserScoring(
  args: UpdateUserScoringArgs
): Promise<UpdateUserScoringResult> {
  const { userId, problemId, analysisId, score, problem, session } = args;
  
  const useExternalSession = Boolean(session);
  const txnSession = session ?? (await mongoose.startSession());
  
  try {
    let result: UpdateUserScoringResult = {
      points: 0,
      totalPoints: 0,
      averageScore: 0,
      highestScore: 0,
      skillsUpdated: [],
      techStackUpdated: [],
      learningProgressUpdated: []
    };
    
    await txnSession.withTransaction(async () => {
      // Calculate points
      const points = calculatePoints({ score, difficulty: problem.difficulty });
      
      // Extract skills from problem
      const { skills, techStack, learningTopics } = extractSkillsFromProblem(problem);
      
      // Prepare update operations
      const updateOps: any[] = [];
      const skillsUpdated: string[] = [];
      const techStackUpdated: string[] = [];
      const learningProgressUpdated: string[] = [];
      
      // 1. Update problem history
      updateOps.push({
        $push: {
          problemHistory: {
            problemId: new mongoose.Types.ObjectId(problemId),
            analysisId: new mongoose.Types.ObjectId(analysisId),
            score,
            points,
            difficulty: problem.difficulty,
            category: problem.category,
            tags: problem.tags,
            solvedAt: new Date(),
            reattempts: 0 // Will be calculated based on existing history
          }
        }
      });
      
      // 2. Update stats
      updateOps.push({
        $inc: {
          'stats.totalPoints': points,
          [`stats.problemsByDifficulty.${problem.difficulty}.solved`]: 1,
          [`stats.problemsByDifficulty.${problem.difficulty}.totalPoints`]: points,
          [`stats.problemsByCategory.${problem.category}.solved`]: 1,
          [`stats.problemsByCategory.${problem.category}.totalPoints`]: points,
        }
      });
      
      // 3. Update skills
      skills.forEach(({ skill, category }) => {
        const skillKey = `skillTracking.skills.${skill.replace(/\s+/g, '_')}`;
        updateOps.push({
          $inc: {
            [`${skillKey}.problemsSolved`]: 1,
            [`${skillKey}.totalPoints`]: points,
          },
          $set: {
            [`${skillKey}.lastSolvedAt`]: new Date(),
            [`${skillKey}.lastUpdated`]: new Date(),
          }
        });
        skillsUpdated.push(skill);
      });
      
      // 4. Update tech stack
      techStack.forEach(({ technology, category }) => {
        const techKey = `skillTracking.techStack.${technology.replace(/\s+/g, '_')}`;
        updateOps.push({
          $inc: {
            [`${techKey}.problemsSolved`]: 1,
            [`${techKey}.totalPoints`]: points,
          },
          $set: {
            [`${techKey}.lastUsedAt`]: new Date(),
            [`${techKey}.lastUpdated`]: new Date(),
          }
        });
        techStackUpdated.push(technology);
      });
      
      // 5. Update learning progress
      learningTopics.forEach(({ topic, category }) => {
        const topicKey = `skillTracking.learningProgress.${topic.replace(/\s+/g, '_')}`;
        updateOps.push({
          $inc: {
            [`${topicKey}.problemsSolved`]: 1,
            [`${topicKey}.totalPoints`]: points,
          },
          $set: {
            [`${topicKey}.lastStudiedAt`]: new Date(),
            [`${topicKey}.lastUpdated`]: new Date(),
          }
        });
        learningProgressUpdated.push(topic);
      });
      
      // Apply all updates
      for (const updateOp of updateOps) {
        await User.updateOne({ _id: userId }, updateOp, { session: txnSession });
      }
      
      // Lightweight activity and daily bucket updates
      try {
        const userTzDate = new Date();
        const y = userTzDate.getFullYear();
        const m = String(userTzDate.getMonth() + 1).padStart(2, '0');
        const d = String(userTzDate.getDate()).padStart(2, '0');
        const dayKey = `${y}-${m}-${d}`;

        await User.updateOne(
          { _id: userId },
          {
            $push: {
              activityLog: {
                type: 'problem_solved',
                points,
                category: problem.category,
                occurredAt: new Date(),
                meta: { problemId, analysisId, difficulty: problem.difficulty }
              }
            },
            $setOnInsert: { dailyStats: [] },
            $inc: {
              'stats.problemsSolved': 1
            }
          },
          { session: txnSession }
        );

        // Upsert daily stats entry
        await User.updateOne(
          { _id: userId, 'dailyStats.date': dayKey },
          { $inc: { 'dailyStats.$.points': points, 'dailyStats.$.problemsSolved': 1 } },
          { session: txnSession }
        );
        await User.updateOne(
          { _id: userId, 'dailyStats.date': { $ne: dayKey } },
          { $push: { dailyStats: { date: dayKey, points, problemsSolved: 1 } } },
          { session: txnSession }
        );
      } catch (_) {
        // non-fatal best-effort
      }

      // Get updated user stats
      const updatedUser = await User.findById(userId)
        .select('stats problemHistory')
        .session(txnSession)
        .lean();
      
      if (updatedUser) {
        // Calculate averages
        const totalProblems = updatedUser.stats.problemsSolved;
        const totalPoints = updatedUser.stats.totalPoints;
        
        // Calculate average score from problem history
        const totalScore = updatedUser.problemHistory.reduce((sum, hist) => sum + hist.score, 0);
        const averageScore = totalProblems > 0 ? Math.round(totalScore / totalProblems) : 0;
        
        // Find highest score
        const highestScore = updatedUser.problemHistory.length > 0 
          ? Math.max(...updatedUser.problemHistory.map(h => h.score))
          : 0;
        
        // Update averages
        await User.updateOne(
          { _id: userId },
          {
            $set: {
              'stats.averageScore': averageScore,
              'stats.highestScore': highestScore,
              [`stats.problemsByDifficulty.${problem.difficulty}.averageScore`]: 
                updatedUser.stats.problemsByDifficulty[problem.difficulty].solved > 0
                  ? Math.round(updatedUser.stats.problemsByDifficulty[problem.difficulty].totalPoints / 
                              updatedUser.stats.problemsByDifficulty[problem.difficulty].solved)
                  : 0,
              [`stats.problemsByCategory.${problem.category}.averageScore`]:
                updatedUser.stats.problemsByCategory[problem.category].solved > 0
                  ? Math.round(updatedUser.stats.problemsByCategory[problem.category].totalPoints / 
                              updatedUser.stats.problemsByCategory[problem.category].solved)
                  : 0,
            }
          },
          { session: txnSession }
        );
        
        result = {
          points,
          totalPoints: updatedUser.stats.totalPoints,
          averageScore,
          highestScore,
          skillsUpdated,
          techStackUpdated,
          learningProgressUpdated
        };
      }
    });
    
    return result;
  } finally {
    if (!useExternalSession) txnSession.endSession();
  }
}

/**
 * Get user's skill summary
 */
export async function getUserSkillSummary(userId: string | Types.ObjectId) {
  const user = await User.findById(userId)
    .select('skillTracking stats dailyStats learningPatterns roleMatch comparisons activeGoal goalsHistory')
    .lean();
  
  if (!user) return null;
  
  // Handle case where skillTracking fields don't exist yet (before migration)
  const skillTracking = user.skillTracking || {
    skills: [],
    techStack: [],
    learningProgress: []
  };
  
  return {
    totalPoints: user.stats?.totalPoints || 0,
    averageScore: user.stats?.averageScore || 0,
    highestScore: user.stats?.highestScore || 0,
    skills: skillTracking.skills || [],
    techStack: skillTracking.techStack || [],
    learningProgress: skillTracking.learningProgress || [],
    dailyStats: user.dailyStats || [],
    learningPatterns: user.learningPatterns || {},
    roleMatch: user.roleMatch || {},
    activeGoal: user.activeGoal || null,
    goalsHistory: user.goalsHistory || [],
    problemsByDifficulty: user.stats?.problemsByDifficulty || {
      easy: { solved: 0, averageScore: 0, totalPoints: 0 },
      medium: { solved: 0, averageScore: 0, totalPoints: 0 },
      hard: { solved: 0, averageScore: 0, totalPoints: 0 },
      expert: { solved: 0, averageScore: 0, totalPoints: 0 }
    },
    problemsByCategory: user.stats?.problemsByCategory || {
      algorithms: { solved: 0, averageScore: 0, totalPoints: 0 },
      'system-design': { solved: 0, averageScore: 0, totalPoints: 0 },
      'web-development': { solved: 0, averageScore: 0, totalPoints: 0 },
      'mobile-development': { solved: 0, averageScore: 0, totalPoints: 0 },
      'data-science': { solved: 0, averageScore: 0, totalPoints: 0 },
      devops: { solved: 0, averageScore: 0, totalPoints: 0 },
      frontend: { solved: 0, averageScore: 0, totalPoints: 0 },
      backend: { solved: 0, averageScore: 0, totalPoints: 0 }
    }
  };
}

// ---- Additional lightweight analytics helpers ----
export function computeDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeTimeOfDayBucket(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export async function recomputeLearningPatterns(userId: Types.ObjectId, session?: ClientSession) {
  const user = await User.findById(userId).select('problemHistory').session(session || null as any).lean();
  if (!user) return;
  const timeBuckets: Record<string, { sum: number; count: number }> = { morning: { sum: 0, count: 0 }, afternoon: { sum: 0, count: 0 }, evening: { sum: 0, count: 0 }, night: { sum: 0, count: 0 } };
  const diffBuckets: Record<string, { sum: number; count: number }> = { easy: { sum: 0, count: 0 }, medium: { sum: 0, count: 0 }, hard: { sum: 0, count: 0 }, expert: { sum: 0, count: 0 } };
  const catBuckets: Record<string, { sum: number; count: number }> = {};
  for (const h of (user as any).problemHistory || []) {
    const dt = new Date(h.solvedAt || Date.now());
    const bucket = computeTimeOfDayBucket(dt.getHours());
    timeBuckets[bucket].sum += h.score;
    timeBuckets[bucket].count += 1;
    diffBuckets[h.difficulty]?.count !== undefined && (diffBuckets[h.difficulty].sum += h.score, diffBuckets[h.difficulty].count += 1);
    catBuckets[h.category] = catBuckets[h.category] || { sum: 0, count: 0 };
    catBuckets[h.category].sum += h.score;
    catBuckets[h.category].count += 1;
  }
  const timeOfDayPerformance: any = {};
  Object.entries(timeBuckets).forEach(([k, v]) => timeOfDayPerformance[k] = v.count ? Math.round(v.sum / v.count) : 0);
  const difficultyPerformance: any = {};
  Object.entries(diffBuckets).forEach(([k, v]) => difficultyPerformance[k] = v.count ? Math.round(v.sum / v.count) : 0);
  const categoryPerformance: any = {};
  Object.entries(catBuckets).forEach(([k, v]) => categoryPerformance[k] = v.count ? Math.round(v.sum / v.count) : 0);
  await User.updateOne({ _id: userId }, { $set: { learningPatterns: { timeOfDayPerformance, difficultyPerformance, categoryPerformance } } }, { session });
}

export function computeRoleMatchFromSkills(targetRole: string, skills: Array<{ skill: string; averageScore: number }>) {
  // Minimal seed weights; can be extended dynamically
  const roleMatrix: Record<string, Record<string, number>> = {
    'Full-Stack Developer': { 'Frontend Development': 1, 'Backend Development': 1, 'System Design': 0.7, 'DevOps': 0.5, 'Databases': 0.6 },
    'Backend Developer': { 'Backend Development': 1, 'System Design': 0.8, 'Databases': 0.8, 'DevOps': 0.6 },
    'Frontend Developer': { 'Frontend Development': 1, 'Web Development': 0.8, 'System Design': 0.4 },
    'DevOps Engineer': { 'DevOps': 1, 'Cloud': 0.8, 'Backend Development': 0.5, 'Security': 0.6 },
    'AI/ML Engineer': { 'Data Science': 1, 'Algorithms': 0.7, 'Backend Development': 0.6, 'System Design': 0.5 },
  };
  const weights = roleMatrix[targetRole] || roleMatrix['Full-Stack Developer'];
  let totalWeight = 0;
  let scored = 0;
  const gaps: Array<{ skill: string; requiredLevel: number; currentLevel: number }> = [];
  Object.entries(weights).forEach(([axis, w]) => {
    totalWeight += w;
    const found = skills.find(s => s.skill === axis || s.skill === axis.replace(' ', ''));
    const level = found ? found.averageScore : 0;
    scored += (level / 100) * w;
    if (level < 70) gaps.push({ skill: axis, requiredLevel: 70, currentLevel: Math.round(level) });
  });
  const matchPercent = totalWeight ? Math.round((scored / totalWeight) * 100) : 0;
  return { matchPercent, gaps };
}

export async function recomputeRoleMatch(userId: Types.ObjectId, targetRole?: string, session?: ClientSession) {
  const user = await User.findById(userId).select('skillTracking roleMatch activeGoal').session(session || null as any).lean();
  if (!user) return;
  const role = targetRole || (user as any).activeGoal?.role || (user as any).roleMatch?.targetRole || 'Full-Stack Developer';
  const skills = ((user as any).skillTracking?.skills || []).map((s: any) => ({ skill: s.skill, averageScore: s.averageScore }));
  const { matchPercent, gaps } = computeRoleMatchFromSkills(role, skills);
  await User.updateOne({ _id: userId }, { $set: { roleMatch: { targetRole: role, matchPercent, gaps, lastComputedAt: new Date() } } }, { session });
}

export async function getDashboardSummary(userId: string | Types.ObjectId) {
  const user = await User.findById(userId)
    .select('stats skillTracking dailyStats roleMatch activeGoal')
    .lean();
  if (!user) return null;
  return {
    totalPoints: user.stats?.totalPoints || 0,
    averageScore: user.stats?.averageScore || 0,
    highestScore: user.stats?.highestScore || 0,
    skills: user.skillTracking?.skills || [],
    dailyStats: user.dailyStats || [],
    roleMatch: user.roleMatch || {},
    activeGoal: user.activeGoal || null,
  };
}

export async function rebuildDailyStatsFromHistory(userId: Types.ObjectId, session?: ClientSession) {
  const user = await User.findById(userId).select('problemHistory').session(session || null as any).lean();
  if (!user) return;
  const buckets: Record<string, { points: number; problemsSolved: number }> = {};
  for (const h of (user as any).problemHistory || []) {
    const dt = new Date(h.solvedAt || Date.now());
    const key = computeDayKey(dt);
    if (!buckets[key]) buckets[key] = { points: 0, problemsSolved: 0 };
    buckets[key].points += h.points || 0;
    buckets[key].problemsSolved += 1;
  }
  const dailyStats = Object.entries(buckets).map(([date, v]) => ({ date, points: v.points, problemsSolved: v.problemsSolved }));
  await User.updateOne({ _id: userId }, { $set: { dailyStats } }, { session });
}

export async function getUserInsights(userId: string | Types.ObjectId) {
  const user = await User.findById(userId)
    .select('stats dailyStats learningPatterns roleMatch comparisons skillTracking problemHistory activeGoal')
    .lean();
  if (!user) return null;
  return {
    totals: {
      points: user.stats?.totalPoints || 0,
      averageScore: user.stats?.averageScore || 0,
      highestScore: user.stats?.highestScore || 0,
      problemsSolved: user.stats?.problemsSolved || (user as any).problemHistory?.length || 0,
    },
    problemsByDifficulty: user.stats?.problemsByDifficulty || {},
    problemsByCategory: user.stats?.problemsByCategory || {},
    dailyStats: user.dailyStats || [],
    learningPatterns: user.learningPatterns || {},
    roleMatch: user.roleMatch || {},
    comparisons: user.comparisons || {},
    activeGoal: (user as any).activeGoal || null,
  };
}

export async function getNextUpRecommendation(userId: string | Types.ObjectId) {
  const user = await User.findById(userId)
    .select('zemonStreak lastZemonVisit stats skillTracking activeGoal bookmarkedResources')
    .lean();
  if (!user) return null;

  const now = new Date();
  const lastVisit = (user as any).lastZemonVisit ? new Date((user as any).lastZemonVisit) : null;
  const hoursSinceVisit = lastVisit ? (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60) : Infinity;
  const totalPoints = (user as any).stats?.totalPoints || 0;
  const skills: Array<{ skill: string; averageScore: number; problemsSolved: number }>
    = (((user as any).skillTracking?.skills) || []).map((s: any) => ({ skill: s.skill, averageScore: s.averageScore || 0, problemsSolved: s.problemsSolved || 0 }));

  // Helper: find weakest focus skill or weakest category proxy
  const activeGoal = (user as any).activeGoal;
  let weakestSkill: string | null = null;
  if (activeGoal?.focusSkills?.length) {
    const subset = skills.filter(s => activeGoal.focusSkills.includes(s.skill));
    subset.sort((a, b) => a.averageScore - b.averageScore);
    weakestSkill = subset[0]?.skill || null;
  } else if (skills.length) {
    const sorted = [...skills].sort((a, b) => a.averageScore - b.averageScore);
    weakestSkill = sorted[0]?.skill || null;
  }

  // 1) Streak at risk: if last visit > 20 hours ago
  if (hoursSinceVisit > 20) {
    return {
      type: 'streak',
      title: `Keep your ${((user as any).zemonStreak || 0)}-day streak alive!`,
      description: 'Solve one quick problem to maintain your momentum.',
      tags: [weakestSkill || 'general', 'beginner', '~10 mins'],
      action: { kind: 'solve_problem', difficulty: 'easy', category: 'algorithms' }
    };
  }

  // 2) Goal gap: if a focus skill is low (<60)
  if (weakestSkill) {
    const weak = skills.find(s => s.skill === weakestSkill);
    if ((weak?.averageScore || 0) < 60) {
      return {
        type: 'goal_gap',
        title: `Boost ${weakestSkill} towards your goal`,
        description: `You're at ${weak?.averageScore || 0}% in ${weakestSkill}. Aim for 70% with one targeted challenge.`,
        tags: [weakestSkill, 'medium', '~20 mins'],
        action: { kind: 'solve_problem', difficulty: 'medium', category: 'web-development' }
      };
    }
  }

  // 3) Near achievement: push to next points milestone
  const nextMilestone = totalPoints < 100 ? 100 : totalPoints < 500 ? 500 : totalPoints < 1000 ? 1000 : totalPoints + 100;
  if (nextMilestone - totalPoints <= 50) {
    return {
      type: 'milestone',
      title: `You're close: ${nextMilestone} points milestone`,
      description: `Earn ${nextMilestone - totalPoints} more points to unlock a new achievement.`,
      tags: ['points', 'quick-win', '~15 mins'],
      action: { kind: 'solve_problem', difficulty: 'medium' }
    };
  }

  // 4) Default: suggest exploring a bookmarked resource if available
  const hasBookmarks = ((user as any).bookmarkedResources || []).length > 0;
  if (hasBookmarks) {
    return {
      type: 'resource',
      title: 'Review a bookmarked resource',
      description: 'Deepen your understanding with a resource you saved for later.',
      tags: ['bookmark', '~20 mins'],
      action: { kind: 'open_bookmarks' }
    };
  }

  // Fallback generic recommendation
  return {
    type: 'explore',
    title: 'Try a new category',
    description: 'Broaden your skillset by exploring an unexplored area.',
    tags: ['explore', 'diversity'],
    action: { kind: 'explore_category', category: 'system-design' }
  };
}
