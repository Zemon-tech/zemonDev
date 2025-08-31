import { motion } from 'framer-motion';
import { TrendingUp, Code, Database, Cloud, Brain, Target } from 'lucide-react';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GradientText } from '@/components/blocks/GradientText';
import { CircularProgress } from '@/components/blocks/CircularProgress';
import { getTopSkills, getTopTechnologies, getCategoryBreakdown } from '@/lib/userScoringApi';
import { UserScoringData } from '@/lib/userScoringApi';

interface SkillTrackingCardProps {
  scoringData: UserScoringData | null;
  loading: boolean;
}

export function SkillTrackingCard({ scoringData, loading }: SkillTrackingCardProps) {
  if (loading || !scoringData) {
    return (
      <SpotlightCard className="bg-gradient-to-br from-base-200/80 to-base-100/60 rounded-xl shadow-lg p-4 border border-base-300/50">
        <div className="animate-pulse">
          <div className="h-4 bg-base-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-base-300 rounded"></div>
            <div className="h-3 bg-base-300 rounded w-5/6"></div>
            <div className="h-3 bg-base-300 rounded w-4/6"></div>
          </div>
        </div>
      </SpotlightCard>
    );
  }

  const topSkills = getTopSkills(scoringData.skills, 3);
  const topTechnologies = getTopTechnologies(scoringData.techStack, 3);
  const categoryBreakdown = getCategoryBreakdown(scoringData.problemsByCategory);

  const getSkillIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'programming':
        return <Code className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'cloud':
        return <Cloud className="w-4 h-4" />;
      case 'algorithms':
        return <Brain className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'text-purple-500';
      case 'advanced':
        return 'text-blue-500';
      case 'intermediate':
        return 'text-green-500';
      default:
        return 'text-orange-500';
    }
  };

  return (
    <SpotlightCard className="bg-gradient-to-br from-base-200/80 to-base-100/60 rounded-xl shadow-lg p-4 border border-base-300/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-accent font-heading flex items-center gap-2">
          <TrendingUp className="text-accent w-4 h-4" /> 
          <GradientText text="Skill Progress" gradient="from-accent to-primary" className="text-sm" />
        </h2>
      </div>

      <div className="space-y-4">
        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-base-content/80 mb-2">Top Skills</h3>
            <div className="space-y-2">
              {topSkills.map((skill, index) => (
                <motion.div
                  key={skill.skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg border border-base-300/30"
                >
                  <div className="flex items-center gap-2">
                    {getSkillIcon(skill.category)}
                    <div>
                      <span className="text-xs font-medium text-base-content">{skill.skill}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${getLevelColor(skill.level)}`}>
                          {skill.level}
                        </span>
                        <span className="text-xs text-base-content/60">
                          • {skill.problemsSolved} problems
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{skill.totalPoints} pts</span>
                    <CircularProgress 
                      value={skill.progress} 
                      size={24} 
                      strokeWidth={2}
                    >
                      <span className="text-xs font-bold">{skill.progress}%</span>
                    </CircularProgress>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Top Technologies */}
        {topTechnologies.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-base-content/80 mb-2">Top Technologies</h3>
            <div className="space-y-2">
              {topTechnologies.map((tech, index) => (
                <motion.div
                  key={tech.technology}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + topSkills.length) * 0.1 }}
                  className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg border border-base-300/30"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-xs font-medium text-base-content">{tech.technology}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-base-content/60">
                          {tech.problemsSolved} problems • {tech.proficiency}% proficiency
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">{tech.totalPoints} pts</span>
                    <CircularProgress 
                      value={tech.proficiency} 
                      size={24} 
                      strokeWidth={2}
                    >
                      <span className="text-xs font-bold">{tech.proficiency}%</span>
                    </CircularProgress>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-base-content/80 mb-2">Performance by Category</h3>
            <div className="space-y-2">
              {categoryBreakdown.slice(0, 3).map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + topSkills.length + topTechnologies.length) * 0.1 }}
                  className="flex items-center justify-between p-2 bg-base-100/50 rounded-lg border border-base-300/30"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-base-content">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-base-content/60">{category.solved} solved</span>
                    <span className="text-xs font-bold text-primary">{category.totalPoints} pts</span>
                    <span className="text-xs font-bold text-success">{category.averageScore}% avg</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
