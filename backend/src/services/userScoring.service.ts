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
  
  // Base points for the difficulty level
  const basePoints = BASE_POINTS[difficulty];
  
  // Multiplier based on difficulty
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  
  // Score multiplier (0-100 score becomes 0.1-1.0 multiplier)
  const scoreMultiplier = score / 100;
  
  // Calculate final points
  const points = Math.round(basePoints * multiplier * scoreMultiplier);
  
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
    .select('skillTracking stats')
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
