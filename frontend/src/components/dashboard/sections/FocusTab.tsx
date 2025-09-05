import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';

// Smart analysis functions (moved from SkillBreakdownCard)
const analyzeSkillFocus = (skills: any[]) => {
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
    if (skill.averageScore >= 35 && skill.averageScore < 60) return true;
    if (skill.averageScore >= 70 && skill.averageScore < 90) return true;
    if (skill.averageScore >= 85 && skill.averageScore < 100) return true;
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
  skill: any;
  message: string;
  icon: React.ComponentType<any>;
}

const analyzeImprovements = (skills: any[]): Improvement[] => {
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

export function FocusTab({
  loading,
  summary,
}: {
  loading: boolean;
  summary: any;
}) {
  const theme = (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '') || '';
  const isDarkTheme = theme === 'dark' || theme === 'halloween';

  const COLOR_PRIMARY = isDarkTheme ? '#ffffff' : 'hsl(var(--p))';
  const COLOR_GRID = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'hsl(var(--bc) / 0.15)';
  const AXIS_TICK = isDarkTheme ? '#ffffff' : undefined;
  const TOOLTIP_BG = isDarkTheme ? 'rgba(0,0,0,0.85)' : 'hsl(var(--b1))';
  const TOOLTIP_BORDER = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'hsl(var(--bc) / 0.15)';
  const weakestSkills = Array.isArray(summary?.skills)
    ? [...summary.skills]
        .sort((a: any, b: any) => (a.averageScore||0) - (b.averageScore||0))
        .slice(0,6)
    : [];

  const chartData = weakestSkills.map((s: any) => ({ label: s.skill, value: Number(s.averageScore || 0) }));
  const focusSkills = summary?.activeGoal?.focusSkills || [];
  const roleMatch = summary?.roleMatch;
  const gaps = Array.isArray(roleMatch?.gaps) ? roleMatch.gaps.slice(0,5) : [];

  // Get analysis data from skills
  const skills = summary?.skills || [];
  const { recommendations } = analyzeSkillFocus(skills);
  const improvements = analyzeImprovements(skills);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-7">
        <DashboardCard variant="default" hoverEffect className="p-4 border-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 backdrop-blur-sm">
                <Target className="w-3 h-3 text-primary" />
              </div>
              <div className="text-sm font-semibold text-base-content/80">Focus Areas</div>
            </div>
            {focusSkills.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {focusSkills.slice(0,3).map((fs: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full px-2 py-0.5 text-[10px] bg-primary/10 border-primary/20 text-primary">{fs}</Badge>
                ))}
              </div>
            )}
          </div>
          {loading ? (
            <div className="h-24 animate-pulse bg-base-300/50 rounded" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                {weakestSkills.length > 0 ? (
                  weakestSkills.map((s: any, idx: number) => (
                    <motion.div 
                      key={`${s.skill}-${idx}`} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="space-y-2 p-3 bg-gradient-to-r from-base-100/30 via-base-200/20 to-base-100/30 rounded-xl border border-transparent hover:border-primary/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[60%] font-medium text-sm">{s.skill}</span>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary">{s.averageScore || 0}%</Badge>
                      </div>
                      <Progress value={Number(s.averageScore || 0)} className="h-2" />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-base-content/60">No skills yet.</div>
                )}
              </div>
              <div className="h-40">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_GRID} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS_TICK }} hide />
                      <YAxis domain={[0,100]} width={28} tick={{ fontSize: 10, fill: AXIS_TICK }} />
                      <ReTooltip contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }} />
                      <Bar dataKey="value" name="Avg %" fill={COLOR_PRIMARY} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-md border border-base-200/60 bg-base-100/40 flex items-center justify-center text-[11px] text-base-content/60">
                    Not enough skill data to display a chart.
                  </div>
                )}
              </div>
            </div>
          )}
        </DashboardCard>
      </div>
      <div className="xl:col-span-5">
        <DashboardCard variant="default" hoverEffect className="p-4 border-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 backdrop-blur-sm">
              <Brain className="w-3 h-3 text-accent" />
            </div>
            <div className="text-sm font-semibold text-base-content/80">Role Match</div>
          </div>
          {loading ? (
            <div className="h-24 animate-pulse bg-base-300/50 rounded" />
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-transparent hover:border-accent/20 transition-all duration-200 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-base-content/80">
                    <span className="font-semibold">{summary?.roleMatch?.targetRole || '—'}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-accent/10 border-accent/20 text-accent">{summary?.roleMatch?.matchPercent ?? 0}%</Badge>
                </div>
                <Progress value={Number(summary?.roleMatch?.matchPercent ?? 0)} className="h-2" />
              </div>
              {gaps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-base-content/60 font-medium">Recommendations</div>
                  <div className="flex flex-wrap gap-2">
                    {gaps.map((g: any, i: number) => (
                      <Badge key={i} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] bg-warning/10 border-warning/20 text-warning">Practice {g.skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Recent Progress Section */}
      {improvements.length > 0 && (
        <div className="xl:col-span-6">
          <DashboardCard variant="default" className="p-4 border-transparent">
            <h3 className="text-sm font-semibold text-base-content/80 mb-3 flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-success" />
              Recent Progress
            </h3>
            <div className="space-y-2">
              {improvements.map((improvement, idx) => (
                <motion.div
                  key={`${improvement.type}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-success/10 via-emerald-500/5 to-success/10 rounded-xl border border-transparent hover:border-success/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 backdrop-blur-sm">
                    <improvement.icon className="w-4 h-4 text-success flex-shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-base-content">
                      {improvement.message}
                    </span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-success" />
                </motion.div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Smart Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="xl:col-span-6">
          <DashboardCard variant="default" className="p-4 border-transparent">
            <h3 className="text-sm font-semibold text-base-content/80 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={`${rec.type}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-opacity-20 transition-all duration-200 backdrop-blur-sm ${
                    rec.type === 'improvement' 
                      ? 'bg-gradient-to-r from-warning/10 via-amber-500/5 to-warning/10 hover:border-warning/20' 
                      : rec.type === 'next-level'
                      ? 'bg-gradient-to-r from-success/10 via-emerald-500/5 to-success/10 hover:border-success/20'
                      : 'bg-gradient-to-r from-info/10 via-blue-500/5 to-info/10 hover:border-info/20'
                  }`}
                >
                  {rec.type === 'improvement' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/20 backdrop-blur-sm">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    </div>
                  )}
                  {rec.type === 'next-level' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                  )}
                  {rec.type === 'explore' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-info/20 backdrop-blur-sm">
                      <Lightbulb className="w-4 h-4 text-info" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-base-content">
                      {rec.message}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="xl:col-span-12">
        <DashboardCard variant="default" className="p-4 border-transparent">
          <h3 className="text-sm font-semibold text-base-content/80 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-xl border border-transparent hover:border-primary/20 text-sm font-medium text-primary hover:bg-primary/15 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm mx-auto mb-2">
                <Target className="w-4 h-4" />
              </div>
              <span className="block">Practice Weak Skills</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-transparent hover:border-accent/20 text-sm font-medium text-accent hover:bg-accent/15 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 backdrop-blur-sm mx-auto mb-2">
                <Brain className="w-4 h-4" />
              </div>
              <span className="block">Explore New Areas</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-success/10 via-success/5 to-success/10 rounded-xl border border-transparent hover:border-success/20 text-sm font-medium text-success hover:bg-success/15 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20 backdrop-blur-sm mx-auto mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="block">Focus on Strengths</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gradient-to-br from-warning/10 via-warning/5 to-warning/10 rounded-xl border border-transparent hover:border-warning/20 text-sm font-medium text-warning hover:bg-warning/15 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/20 backdrop-blur-sm mx-auto mb-2">
                <Lightbulb className="w-4 h-4" />
              </div>
              <span className="block">Get Insights</span>
            </motion.button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}


