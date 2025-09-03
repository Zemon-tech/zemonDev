import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';

export function InsightsTab({
  loading,
  insights,
}: {
  loading: boolean;
  insights: any;
}) {
  const theme = (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '') || '';
  const isDarkTheme = theme === 'dark' || theme === 'halloween';

  const COLOR_PRIMARY = isDarkTheme ? '#ffffff' : 'hsl(var(--p))';
  const GRID = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'hsl(var(--bc) / 0.15)';
  const AXIS = isDarkTheme ? '#ffffff' : undefined;
  const TOOLTIP_BG = isDarkTheme ? 'rgba(0,0,0,0.85)' : 'hsl(var(--b1))';
  const TOOLTIP_BORDER = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'hsl(var(--bc) / 0.15)';
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-6">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Time of Day Performance</div>
            <Badge variant="outline" className="text-[10px]">Avg score</Badge>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse bg-base-300/50 rounded" />
          ) : insights?.learningPatterns?.timeOfDayPerformance ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(insights.learningPatterns.timeOfDayPerformance).map(([k,v]: any) => ({ label: k, value: v }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS }} />
                  <YAxis width={30} tick={{ fontSize: 10, fill: AXIS }} />
                  <ReTooltip contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }} />
                  <Bar dataKey="value" name="Avg score" fill={COLOR_PRIMARY} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-base-content/60">No data available.</div>
          )}
        </DashboardCard>
      </div>
      <div className="xl:col-span-6">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Difficulty Performance</div>
            <Badge variant="outline" className="text-[10px]">Avg score</Badge>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse bg-base-300/50 rounded" />
          ) : insights?.learningPatterns?.difficultyPerformance ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(insights.learningPatterns.difficultyPerformance).map(([k,v]: any) => ({ label: k, value: v }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS }} />
                  <YAxis width={30} tick={{ fontSize: 10, fill: AXIS }} />
                  <ReTooltip contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }} />
                  <Bar dataKey="value" name="Avg score" fill={COLOR_PRIMARY} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-base-content/60">No data available.</div>
          )}
        </DashboardCard>
      </div>
      <div className="xl:col-span-12">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Category Performance</div>
            <Badge variant="outline" className="text-[10px]">Avg score</Badge>
          </div>
          {loading ? (
            <div className="h-56 animate-pulse bg-base-300/50 rounded" />
          ) : insights?.learningPatterns?.categoryPerformance ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={Object.entries(insights.learningPatterns.categoryPerformance).map(([k,v]: any) => ({ subject: String(k), A: v }))}>
                    <PolarGrid gridType="circle" stroke={GRID} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: AXIS }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: AXIS }} stroke={GRID} />
                    <Radar name="Avg" dataKey="A" stroke={COLOR_PRIMARY} fill={isDarkTheme ? 'rgba(255,255,255,0.35)' : 'hsl(var(--p))'} fillOpacity={0.35} dot={{ r: 3, fill: COLOR_PRIMARY, stroke: 'transparent' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(insights.learningPatterns.categoryPerformance).map(([k,v]: any) => ({ name: String(k), value: v }))} dataKey="value" nameKey="name" outerRadius={80} label labelLine={{ stroke: AXIS }}>
                      {Object.entries(insights.learningPatterns.categoryPerformance).map(([,], index) => (
                        <Cell key={`cell-${index}`} fill={isDarkTheme ? '#ffffff' : 'hsl(var(--a))'} opacity={0.25 + (index % 5) * 0.12} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-base-content/60">No data available.</div>
          )}
        </DashboardCard>
      </div>
      <div className="xl:col-span-12">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Role Match</div>
            <Badge variant="outline" className="text-[10px]">Match %</Badge>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse bg-base-300/50 rounded" />
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: 'Match', value: Number(insights?.roleMatch?.matchPercent ?? 0) }]} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={10} fill={COLOR_PRIMARY} />
                  <ReTooltip contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}` }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}


