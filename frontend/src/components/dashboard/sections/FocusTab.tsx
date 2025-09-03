import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';

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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-7">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Focus Areas</div>
            {focusSkills.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {focusSkills.slice(0,3).map((fs: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">{fs}</Badge>
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
                    <div key={`${s.skill}-${idx}`} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[60%] font-medium">{s.skill}</span>
                        <Badge variant="outline" className="text-[10px]">{s.averageScore || 0}%</Badge>
                      </div>
                      <Progress value={Number(s.averageScore || 0)} className="h-2" />
                    </div>
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
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="text-sm font-semibold text-base-content/80 mb-2">Role Match</div>
          {loading ? (
            <div className="h-24 animate-pulse bg-base-300/50 rounded" />
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="text-xs text-base-content/80">
                  <span className="font-semibold">{summary?.roleMatch?.targetRole || '—'}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">{summary?.roleMatch?.matchPercent ?? 0}%</Badge>
              </div>
              <Progress value={Number(summary?.roleMatch?.matchPercent ?? 0)} className="h-2" />
              {gaps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-base-content/60">Recommendations</div>
                  <div className="flex flex-wrap gap-2">
                    {gaps.map((g: any, i: number) => (
                      <Badge key={i} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">Practice {g.skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}


