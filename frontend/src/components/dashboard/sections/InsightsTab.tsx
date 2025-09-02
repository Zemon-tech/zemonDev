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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis width={30} tick={{ fontSize: 10 }} />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--b1))', border: '1px solid hsl(var(--bc) / 0.15)' }} />
                  <Bar dataKey="value" name="Avg score" fill="hsl(var(--p))" radius={[4,4,0,0]} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis width={30} tick={{ fontSize: 10 }} />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--b1))', border: '1px solid hsl(var(--bc) / 0.15)' }} />
                  <Bar dataKey="value" name="Avg score" fill="hsl(var(--p))" radius={[4,4,0,0]} />
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
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Avg" dataKey="A" stroke="hsl(var(--p))" fill="hsl(var(--p))" fillOpacity={0.3} dot={{ r: 3, fill: 'hsl(var(--p))', stroke: 'transparent' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(insights.learningPatterns.categoryPerformance).map(([k,v]: any) => ({ name: String(k), value: v }))} dataKey="value" nameKey="name" outerRadius={80} label>
                      {Object.entries(insights.learningPatterns.categoryPerformance).map(([,], index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--a))`} opacity={0.35 + (index % 5) * 0.1} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={{ background: 'hsl(var(--b1))', border: '1px solid hsl(var(--bc) / 0.15)' }} />
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
                  <RadialBar background dataKey="value" cornerRadius={10} fill="hsl(var(--p))" />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--b1))', border: '1px solid hsl(var(--bc) / 0.15)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}


