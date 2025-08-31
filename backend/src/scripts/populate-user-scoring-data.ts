import mongoose from 'mongoose';
import env from '../config/env';
import { calculatePoints, extractSkillsFromProblem, determineSkillLevel } from '../services/userScoring.service';

async function populateUserScoringData() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const usersCollection = db.collection('users');
    const solutionAnalysesCollection = db.collection('solutionanalyses');
    const crucibleProblemsCollection = db.collection('crucibleproblems');

    console.log('Starting to populate user scoring data...');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users to process`);

    let processedUsers = 0;
    let totalPointsCalculated = 0;

    for (const user of users) {
      try {
        // Get all solution analyses for this user
        const analyses = await solutionAnalysesCollection.find({
          userId: user._id
        }).toArray();

        if (analyses.length === 0) {
          console.log(`No analyses found for user ${user.username || user._id}`);
          processedUsers++;
          continue;
        }

        console.log(`Processing ${analyses.length} analyses for user ${user.username || user._id}`);

        // Initialize scoring data
        const scoringData: {
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
            'web-development': { solved: number; averageScore: number; totalPoints: number };
            'mobile-development': { solved: number; averageScore: number; totalPoints: number };
            'data-science': { solved: number; averageScore: number; totalPoints: number };
            devops: { solved: number; averageScore: number; totalPoints: number };
            frontend: { solved: number; averageScore: number; totalPoints: number };
            backend: { solved: number; averageScore: number; totalPoints: number };
          };
          problemHistory: Array<{
            problemId: any;
            analysisId: any;
            score: number;
            points: number;
            difficulty: any;
            category: any;
            tags: any;
            solvedAt: any;
            reattempts: number;
          }>;
        } = {
          totalPoints: 0,
          averageScore: 0,
          highestScore: 0,
          problemsByDifficulty: {
            easy: { solved: 0, averageScore: 0, totalPoints: 0 },
            medium: { solved: 0, averageScore: 0, totalPoints: 0 },
            hard: { solved: 0, averageScore: 0, totalPoints: 0 },
            expert: { solved: 0, averageScore: 0, totalPoints: 0 }
          },
          problemsByCategory: {
            algorithms: { solved: 0, averageScore: 0, totalPoints: 0 },
            'system-design': { solved: 0, averageScore: 0, totalPoints: 0 },
            'web-development': { solved: 0, averageScore: 0, totalPoints: 0 },
            'mobile-development': { solved: 0, averageScore: 0, totalPoints: 0 },
            'data-science': { solved: 0, averageScore: 0, totalPoints: 0 },
            devops: { solved: 0, averageScore: 0, totalPoints: 0 },
            frontend: { solved: 0, averageScore: 0, totalPoints: 0 },
            backend: { solved: 0, averageScore: 0, totalPoints: 0 }
          },
          problemHistory: []
        };

        // Initialize skill tracking
        const skillTracking: {
          skills: Map<string, {
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
          techStack: Map<string, {
            technology: string;
            category: string;
            proficiency: number;
            problemsSolved: number;
            totalPoints: number;
            averageScore: number;
            lastUsedAt?: Date;
            lastUpdated: Date;
          }>;
          learningProgress: Map<string, {
            topic: string;
            category: string;
            mastery: number;
            problemsSolved: number;
            totalPoints: number;
            averageScore: number;
            lastStudiedAt?: Date;
            lastUpdated: Date;
          }>;
        } = {
          skills: new Map(),
          techStack: new Map(),
          learningProgress: new Map()
        };

        const scores: number[] = [];

        // Process each analysis
        for (const analysis of analyses) {
          try {
            // Get the problem details
            const problem = await crucibleProblemsCollection.findOne({
              _id: analysis.problemId
            });

            if (!problem) {
              console.log(`Problem not found for analysis ${analysis._id}`);
              continue;
            }

            // Calculate score and points
            const score = analysis.overallScore || 0;
            console.log(`Processing problem: ${problem.title}, difficulty: ${problem.difficulty}, score: ${score}`);
            const points = calculatePoints({ score, difficulty: problem.difficulty });
            console.log(`Calculated points: ${points}`);
            
            scores.push(score);
            scoringData.totalPoints += points;
            scoringData.highestScore = Math.max(scoringData.highestScore, score);

            // Update difficulty stats
            const difficultyKey = problem.difficulty as keyof typeof scoringData.problemsByDifficulty;
            scoringData.problemsByDifficulty[difficultyKey].solved++;
            scoringData.problemsByDifficulty[difficultyKey].totalPoints += points;

            // Update category stats
            const categoryKey = problem.category as keyof typeof scoringData.problemsByCategory;
            scoringData.problemsByCategory[categoryKey].solved++;
            scoringData.problemsByCategory[categoryKey].totalPoints += points;

            // Extract skills from problem
            const { skills, techStack, learningTopics } = extractSkillsFromProblem(problem as any);

            // Update skill tracking
            skills.forEach(({ skill, category }) => {
              const key = `${skill}-${category}`;
              const existing = skillTracking.skills.get(key);
              
                             if (existing) {
                 existing.problemsSolved++;
                 existing.totalPoints += points;
                 existing.averageScore = Math.round((existing.averageScore * (existing.problemsSolved - 1) + score) / existing.problemsSolved);
                 existing.level = determineSkillLevel(existing.averageScore, existing.problemsSolved);
                 existing.lastSolvedAt = analysis.createdAt || new Date();
                 existing.lastUpdated = new Date();
               } else {
                                 skillTracking.skills.set(key, {
                   skill,
                   category,
                   level: determineSkillLevel(score, 1),
                   progress: Math.min(score, 100),
                   problemsSolved: 1,
                   totalPoints: points,
                   averageScore: score,
                   lastSolvedAt: analysis.createdAt || new Date(),
                   lastUpdated: new Date()
                 });
              }
            });

            // Update tech stack
            techStack.forEach(({ technology, category }) => {
              const key = `${technology}-${category}`;
              const existing = skillTracking.techStack.get(key);
              
              if (existing) {
                existing.problemsSolved++;
                existing.totalPoints += points;
                existing.averageScore = Math.round((existing.averageScore * (existing.problemsSolved - 1) + score) / existing.problemsSolved);
                existing.lastUsedAt = analysis.createdAt || new Date();
                existing.lastUpdated = new Date();
              } else {
                skillTracking.techStack.set(key, {
                  technology,
                  category,
                  proficiency: Math.min(score, 100),
                  problemsSolved: 1,
                  totalPoints: points,
                  averageScore: score,
                  lastUsedAt: analysis.createdAt || new Date(),
                  lastUpdated: new Date()
                });
              }
            });

            // Update learning progress
            learningTopics.forEach(({ topic, category }) => {
              const key = `${topic}-${category}`;
              const existing = skillTracking.learningProgress.get(key);
              
              if (existing) {
                existing.problemsSolved++;
                existing.totalPoints += points;
                existing.averageScore = Math.round((existing.averageScore * (existing.problemsSolved - 1) + score) / existing.problemsSolved);
                existing.lastStudiedAt = analysis.createdAt || new Date();
                existing.lastUpdated = new Date();
              } else {
                skillTracking.learningProgress.set(key, {
                  topic,
                  category,
                  mastery: Math.min(score, 100),
                  problemsSolved: 1,
                  totalPoints: points,
                  averageScore: score,
                  lastStudiedAt: analysis.createdAt || new Date(),
                  lastUpdated: new Date()
                });
              }
            });

            // Add to problem history
            scoringData.problemHistory.push({
              problemId: analysis.problemId,
              analysisId: analysis._id,
              score,
              points,
              difficulty: problem.difficulty,
              category: problem.category,
              tags: problem.tags || [],
              solvedAt: analysis.createdAt || new Date(),
              reattempts: 0
            });

            totalPointsCalculated += points;

          } catch (analysisError) {
            console.error(`Error processing analysis ${analysis._id}:`, analysisError);
          }
        }

        // Calculate averages
        if (scores.length > 0) {
          scoringData.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        }

        // Calculate difficulty averages
        Object.keys(scoringData.problemsByDifficulty).forEach(difficulty => {
          const diff = scoringData.problemsByDifficulty[difficulty as keyof typeof scoringData.problemsByDifficulty];
          if (diff.solved > 0) {
            diff.averageScore = Math.round(diff.totalPoints / diff.solved);
          }
        });

        // Calculate category averages
        Object.keys(scoringData.problemsByCategory).forEach(category => {
          const cat = scoringData.problemsByCategory[category as keyof typeof scoringData.problemsByCategory];
          if (cat.solved > 0) {
            cat.averageScore = Math.round(cat.totalPoints / cat.solved);
          }
        });

        // Convert Maps to Arrays for database storage
        const skillsArray = Array.from(skillTracking.skills.values());
        const techStackArray = Array.from(skillTracking.techStack.values());
        const learningProgressArray = Array.from(skillTracking.learningProgress.values());

        // Update user with scoring data
        await usersCollection.updateOne(
          { _id: user._id },
          {
            $set: {
              'stats.totalPoints': scoringData.totalPoints,
              'stats.averageScore': scoringData.averageScore,
              'stats.highestScore': scoringData.highestScore,
              'stats.problemsSolved': scoringData.problemHistory.length,
              'stats.problemsByDifficulty': scoringData.problemsByDifficulty,
              'stats.problemsByCategory': scoringData.problemsByCategory,
              'problemHistory': scoringData.problemHistory,
              'skillTracking.skills': skillsArray,
              'skillTracking.techStack': techStackArray,
              'skillTracking.learningProgress': learningProgressArray
            }
          }
        );

        console.log(`Updated user ${user.username || user._id} with ${scoringData.totalPoints} total points and ${skillsArray.length} skills`);
        processedUsers++;

      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
        processedUsers++;
      }
    }

    console.log(`\n=== POPULATION COMPLETED ===`);
    console.log(`Processed users: ${processedUsers}/${users.length}`);
    console.log(`Total points calculated: ${totalPointsCalculated}`);
    console.log(`Average points per user: ${processedUsers > 0 ? Math.round(totalPointsCalculated / processedUsers) : 0}`);

  } catch (error) {
    console.error('Population failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run script if called directly
if (require.main === module) {
  populateUserScoringData()
    .then(() => {
      console.log('Population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Population failed:', error);
      process.exit(1);
    });
}

export default populateUserScoringData;
