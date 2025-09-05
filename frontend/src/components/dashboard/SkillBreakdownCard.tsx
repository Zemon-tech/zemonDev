import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Cloud, 
  Shield, 
  Zap,
  TrendingUp,
  Award,
  Target,
  Brain,
  Cpu,
  Clock
} from 'lucide-react';
import { DashboardCard } from '@/components/dashboard';
import { UserScoringData } from '@/lib/userScoringApi';

// Progress component from 21st.dev
const Progress = ({ 
  value, 
  max = 100, 
  type = "default" 
}: { 
  value: number; 
  max?: number; 
  type?: "default" | "success" | "warning" | "error" | "secondary"; 
}) => {
  const getColor = (_value: number, type: string) => {
    switch (type) {
      case "success":
        return "var(--ds-blue-700)";
      case "warning":
        return "var(--ds-amber-700)";
      case "error":
        return "var(--ds-red-700)";
      case "secondary":
        return "var(--ds-gray-700)";
      default:
        return "var(--ds-gray-1000)";
    }
  };

  return (
    <progress
      value={value}
      max={max}
      className="text-gray-1000 appearance-none border-none [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-[5px] [&::-webkit-progress-value]:rounded-[5px] [&::-moz-progress-bar]:rounded-[5px] h-2.5 w-full [&::-webkit-progress-value]:transition-all [&::-moz-progress-bar]:transition-all"
      style={{ "--ds-progress-color": getColor(value, type) } as React.CSSProperties}
    />
  );
};

interface SkillBreakdownCardProps {
  scoringData?: UserScoringData;
  loading?: boolean;
}

// Map skill names to icons - using both skill names and categories
const skillIcons: { [key: string]: React.ComponentType<any> } = {
  // Skill names
  'Frontend Development': Code,
  'Backend Development': Database,
  'Web Development': Globe,
  'Mobile Development': Smartphone,
  'Cloud Computing': Cloud,
  'Cybersecurity': Shield,
  'Data Science': Zap,
  'Machine Learning': TrendingUp,
  'DevOps': Target,
  'Full Stack': Award,
  'Algorithms': Brain,
  'System Design': Cpu,
  'Database': Database,
  'Programming': Code,
  // Categories (fallback)
  'frontend': Code,
  'backend': Database,
  'web-development': Globe,
  'mobile-development': Smartphone,
  'cloud-computing': Cloud,
  'cybersecurity': Shield,
  'data-science': Zap,
  'machine-learning': TrendingUp,
  'devops': Target,
  'fullstack': Award,
  'algorithms': Brain,
  'system-design': Cpu,
  'database': Database,
  'programming': Code
};

const getSkillLevel = (score: number): { level: string; color: string; type: string } => {
  if (score >= 90) return { level: 'Expert', color: 'text-emerald-500', type: 'success' };
  if (score >= 75) return { level: 'Advanced', color: 'text-blue-500', type: 'success' };
  if (score >= 60) return { level: 'Intermediate', color: 'text-yellow-500', type: 'warning' };
  if (score >= 40) return { level: 'Beginner', color: 'text-orange-500', type: 'warning' };
  return { level: 'Novice', color: 'text-red-500', type: 'error' };
};

// Smart analysis functions
const analyzeSkillFocus = (skills: UserScoringData['skills']) => {
  if (!skills?.length) return { focusedSkills: [], recommendations: [] };
  
  const sortedSkills = skills.sort((a, b) => b.averageScore - a.averageScore);
  const focusedSkills = sortedSkills.slice(0, 3); // Top 3 focused skills
  
  const recommendations = [];
  
  // Find skills that need improvement
  const needsImprovement = skills.filter(skill => skill.averageScore < 60);
  if (needsImprovement.length > 0) {
    recommendations.push({
      type: 'improvement',
      skill: needsImprovement[0],
      message: `Focus on improving ${needsImprovement[0].skill} (${needsImprovement[0].averageScore}%)`
    });
  }
  
  // Find skills that are close to next level
  const nearNextLevel = skills.filter(skill => {
    const { level } = getSkillLevel(skill.averageScore);
    if (level === 'Beginner' && skill.averageScore >= 35) return true;
    if (level === 'Intermediate' && skill.averageScore >= 70) return true;
    if (level === 'Advanced' && skill.averageScore >= 85) return true;
    return false;
  });
  
  if (nearNextLevel.length > 0) {
    recommendations.push({
      type: 'next-level',
      skill: nearNextLevel[0],
      message: `${nearNextLevel[0].skill} is close to the next level!`
    });
  }
  
  // Suggest new skills to explore
  const exploredCategories = new Set(skills.map(s => s.category));
  const allCategories = ['algorithms', 'web-development', 'mobile-development', 'data-science', 'cloud-computing'];
  const unexploredCategories = allCategories.filter(cat => !exploredCategories.has(cat));
  
  if (unexploredCategories.length > 0) {
    recommendations.push({
      type: 'explore',
      category: unexploredCategories[0],
      message: `Consider exploring ${unexploredCategories[0].replace('-', ' ')}`
    });
  }
  
  return { focusedSkills, recommendations };
};

interface Improvement {
  type: 'recent-activity' | 'potential';
  skill: UserScoringData['skills'][0];
  message: string;
  icon: React.ComponentType<any>;
}

const analyzeImprovements = (skills: UserScoringData['skills']): Improvement[] => {
  if (!skills?.length) return [];
  
  const improvements: Improvement[] = [];
  
  // Find skills with most problems solved recently
  const recentActivity = skills
    .filter(skill => skill.lastSolvedAt)
    .sort((a, b) => new Date(b.lastSolvedAt!).getTime() - new Date(a.lastSolvedAt!).getTime())
    .slice(0, 2);
  
  recentActivity.forEach(skill => {
    improvements.push({
      type: 'recent-activity',
      skill,
      message: `Recently solved ${skill.problemsSolved} problems in ${skill.skill}`,
      icon: Clock
    });
  });
  
  // Find skills with highest improvement potential
  const improvementPotential = skills
    .filter(skill => skill.averageScore < 80)
    .sort((a, b) => (80 - a.averageScore) - (80 - b.averageScore))
    .slice(0, 2);
  
  improvementPotential.forEach(skill => {
    improvements.push({
      type: 'potential',
      skill,
      message: `${skill.skill} has room for improvement (${skill.averageScore}%)`,
      icon: TrendingUp
    });
  });
  
  return improvements;
};

export const SkillBreakdownCard: React.FC<SkillBreakdownCardProps> = ({ 
  scoringData, 
  loading = false 
}) => {
  // Debug logging to see the actual data structure
  React.useEffect(() => {
    if (scoringData) {
      console.log('SkillBreakdownCard - scoringData:', scoringData);
      console.log('SkillBreakdownCard - skills:', scoringData.skills);
      if (scoringData.skills?.length > 0) {
        console.log('SkillBreakdownCard - first skill:', scoringData.skills[0]);
      }
    }
  }, [scoringData]);

  if (loading) {
    return (
      <DashboardCard variant="default" className="p-3 sm:p-4 h-auto sm:h-69">
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 bg-base-300 rounded mb-3 sm:mb-4"></div>
          <div className="space-y-2 sm:space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 sm:h-4 bg-base-300 rounded mb-2"></div>
                <div className="h-2 bg-base-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (!scoringData || !scoringData.skills?.length) {
    return (
      <DashboardCard variant="default" className="p-4 h-69">
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">No Skills Yet</h3>
          <p className="text-sm text-base-content/50">
            Start solving problems to build your skill profile!
          </p>
          {scoringData && (
            <div className="mt-4 p-3 bg-base-200/50 rounded-lg text-xs text-base-content/60">
              <p>Debug: Received data but no skills found</p>
              <p>Total Points: {scoringData.totalPoints}</p>
              <p>Skills Count: {scoringData.skills?.length || 0}</p>
            </div>
          )}
        </div>
      </DashboardCard>
    );
  }

  const { focusedSkills, recommendations } = analyzeSkillFocus(scoringData.skills);
  const improvements = analyzeImprovements(scoringData.skills);

  console.log('SkillBreakdownCard - focusedSkills:', focusedSkills);
  console.log('SkillBreakdownCard - recommendations:', recommendations);
  console.log('SkillBreakdownCard - improvements:', improvements);

  return (
    <DashboardCard variant="default" className="p-3 sm:p-4 h-auto sm:h-69 overflow-y-auto border-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm sm:text-lg font-bold text-base-content flex items-center gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="hidden sm:inline">Skill Focus</span>
          <span className="sm:hidden">Skills</span>
        </h2>
        <div className="badge badge-primary badge-sm">
          {scoringData.skills?.length || 0} Skills
        </div>
      </div>

      {/* Focused Skills Section */}
      {focusedSkills.length > 0 && (
        <div className="space-y-3">
          {focusedSkills.map((skill, idx) => {
            const { level, color, type } = getSkillLevel(skill.averageScore);
            // Try to find icon by skill name first, then by category
            const Icon = skillIcons[skill.skill] || skillIcons[skill.category] || Code;
            
            return (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-base-100/30 rounded-xl p-3 border border-transparent hover:border-base-300/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-base-content truncate">
                      {skill.skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-mono text-base-content/70">
                      {skill.averageScore}%
                    </span>
                    <span className={`text-xs font-semibold ${color} hidden sm:inline`}>
                      {level}
                    </span>
                  </div>
                </div>
                <Progress value={skill.averageScore} type={type as any} />
                <div className="flex justify-between text-xs text-base-content/50 mt-2">
                  <span className="truncate">{skill.problemsSolved} problems</span>
                  <span className="flex-shrink-0">{skill.totalPoints} pts</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
};
