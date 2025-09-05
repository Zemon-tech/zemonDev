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
  const focusedSkills = sortedSkills.slice(0, 3);
  
  const recommendations = [];
  
  const needsImprovement = skills.filter(skill => skill.averageScore < 60);
  if (needsImprovement.length > 0) {
    recommendations.push({
      type: 'improvement',
      skill: needsImprovement[0],
      message: `Focus on improving ${needsImprovement[0].skill} (${needsImprovement[0].averageScore}%)`
    });
  }
  
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
  // Get current theme for proper color handling
  const theme = (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '') || '';
  const isDarkTheme = theme === 'dark' || theme === 'halloween';
  
  // Chart colors based on theme
  const CHART_COLOR = isDarkTheme ? '#ffffff' : '#000000';
  const CHART_GRID_COLOR = isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const CHART_TEXT_COLOR = isDarkTheme ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const weakestSkills = Array.isArray(summary?.skills)
    ? [...summary.skills]
        .sort((a: any, b: any) => (a.averageScore||0) - (b.averageScore||0))
        .slice(0,6)
    : [];
  const chartData = weakestSkills.map((s: any) => ({ label: s.skill, value: Number(s.averageScore || 0) }));
  const focusSkills = summary?.activeGoal?.focusSkills || [];
  const roleMatch = summary?.roleMatch;
  const gaps = Array.isArray(roleMatch?.gaps) ? roleMatch.gaps.slice(0,5) : [];
  const skills = summary?.skills || [];
  const { recommendations } = analyzeSkillFocus(skills);
  const improvements = analyzeImprovements(skills);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Focus Areas - Main Section */}
      <div className="lg:col-span-8">
        <DashboardCard variant="default" className="p-4 border-0 bg-base-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
                <Target className="w-3.5 h-3.5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-base-content">Focus Areas</h3>
            </div>
            {focusSkills.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                {focusSkills.slice(0,3).map((fs: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full px-2.5 py-1 text-xs bg-primary/5 border-primary/20 text-primary font-medium">
                    {fs}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-32 animate-pulse bg-base-200/40 rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              {/* Skills List */}
              <div className="xl:col-span-3 space-y-2.5">
                {weakestSkills.length > 0 ? (
                  weakestSkills.map((s: any, idx: number) => (
                    <motion.div 
                      key={`${s.skill}-${idx}`} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group p-3 bg-base-100/60 rounded-xl border-0 hover:bg-base-100/80 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate max-w-[70%] font-semibold text-sm text-base-content">
                          {s.skill}
                        </span>
                        <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary font-bold">
                          {s.averageScore || 0}%
                        </Badge>
                      </div>
                      <Progress 
                        value={Number(s.averageScore || 0)} 
                        className="h-2"
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-base font-semibold text-base-content/80 mb-2">No skills yet</h4>
                    <p className="text-sm text-base-content/60">Start solving problems to build your skill profile!</p>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="xl:col-span-2 h-48 p-4 bg-base-100/40 rounded-xl border-0 backdrop-blur-sm">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.9} />
                          <stop offset="30%" stopColor={CHART_COLOR} stopOpacity={0.7} />
                          <stop offset="70%" stopColor={CHART_COLOR} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: CHART_TEXT_COLOR }} hide />
                      <YAxis 
                        domain={[0, 100]} 
                        width={32} 
                        tick={{ fontSize: 10, fill: CHART_TEXT_COLOR }}
                        stroke={CHART_GRID_COLOR}
                      />
                      <ReTooltip 
                        contentStyle={{ 
                          background: "hsl(var(--b1))", 
                          border: "1px solid hsl(var(--bc) / 0.2)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                          backdropFilter: "blur(16px)"
                        }}
                        labelStyle={{ color: "hsl(var(--bc))" }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Skill Level" 
                        fill="url(#skillGradient)" 
                        radius={[4, 4, 0, 0]}
                        stroke={CHART_COLOR}
                        strokeWidth={0.5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-base-content/70">No skill data</span>
                    <span className="text-xs text-base-content/50">Start solving problems!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Role Match */}
      <div className="lg:col-span-4">
        <DashboardCard variant="default" className="p-4 border-0 bg-base-100/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm">
              <Brain className="w-3.5 h-3.5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-base-content">Role Match</h3>
          </div>

          {loading ? (
            <div className="h-32 animate-pulse bg-base-200/40 rounded-xl" />
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-base-100/60 rounded-xl border-0 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-base-content">
                    {summary?.roleMatch?.targetRole || 'No target role set'}
                  </span>
                  <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30 text-accent font-bold">
                    {summary?.roleMatch?.matchPercent ?? 0}%
                  </Badge>
                </div>
                <Progress 
                  value={Number(summary?.roleMatch?.matchPercent ?? 0)} 
                  className="h-2.5"
                />
              </div>

              {gaps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-base-content/80">Skills to improve</h4>
                  <div className="flex flex-wrap gap-2">
                    {gaps.map((g: any, i: number) => (
                      <Badge key={i} variant="outline" className="rounded-full px-3 py-1 text-xs bg-warning/10 border-warning/30 text-warning">
                        {g.skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Recent Progress & Recommendations */}
      {(improvements.length > 0 || recommendations.length > 0) && (
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recent Progress */}
            {improvements.length > 0 && (
              <DashboardCard variant="default" className="p-4 border-0 bg-base-100/50 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-success/20 to-success/10 backdrop-blur-sm">
                    <ArrowUp className="w-3.5 h-3.5 text-success" />
                  </div>
                  <h3 className="text-base font-bold text-base-content">Recent Progress</h3>
                </div>
                <div className="space-y-2">
                  {improvements.slice(0, 3).map((improvement, idx) => (
                    <motion.div
                      key={`${improvement.type}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-base-100/60 rounded-lg border-0 hover:bg-base-100/80 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 backdrop-blur-sm">
                        <improvement.icon className="w-4 h-4 text-success flex-shrink-0" />
                      </div>
                      <span className="text-sm font-medium text-base-content flex-1">
                        {improvement.message}
                      </span>
                      <CheckCircle className="w-4 h-4 text-success" />
                    </motion.div>
                  ))}
                </div>
              </DashboardCard>
            )}

            {/* Smart Recommendations */}
            {recommendations.length > 0 && (
              <DashboardCard variant="default" className="p-4 border-0 bg-base-100/50 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-warning/20 to-warning/10 backdrop-blur-sm">
                    <Lightbulb className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <h3 className="text-base font-bold text-base-content">Recommendations</h3>
                </div>
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map((rec, idx) => {
                    const getIcon = () => {
                      switch (rec.type) {
                        case 'improvement': return AlertTriangle;
                        case 'next-level': return TrendingUp;
                        default: return Lightbulb;
                      }
                    };
                    const getColor = () => {
                      switch (rec.type) {
                        case 'improvement': return 'warning';
                        case 'next-level': return 'success';
                        default: return 'info';
                      }
                    };
                    const IconComponent = getIcon();
                    const color = getColor();

                    return (
                      <motion.div
                        key={`${rec.type}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-base-100/60 rounded-lg border-0 hover:bg-base-100/80 transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-${color}/10 backdrop-blur-sm`}>
                          <IconComponent className={`w-4 h-4 text-${color}`} />
                        </div>
                        <span className="text-sm font-medium text-base-content flex-1">
                          {rec.message}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </DashboardCard>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="lg:col-span-12">
        <DashboardCard variant="default" className="p-4 border-0 bg-base-100/50 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-base-content">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Target, label: 'Practice Weak Skills', color: 'primary' },
              { icon: Brain, label: 'Explore New Areas', color: 'accent' },
              { icon: TrendingUp, label: 'Focus on Strengths', color: 'success' },
              { icon: Lightbulb, label: 'Get Insights', color: 'warning' }
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 bg-base-100/60 rounded-xl border-0 hover:bg-base-100/80 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-md text-${action.color} group`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-${action.color}/10 mx-auto mb-3 group-hover:bg-${action.color}/20 transition-colors`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="block text-sm font-semibold">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
