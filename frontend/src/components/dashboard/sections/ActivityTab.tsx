import { DashboardCard } from '@/components/dashboard';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function ActivityTab({
  loadingDash,
  summary,
}: {
  loadingDash: boolean;
  summary: any;
}) {
  const theme = (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '') || '';
  const isDarkTheme = theme === 'dark' || theme === 'halloween';

  const axisTickColor = isDarkTheme ? '#ffffff' : 'hsl(var(--bc) / 0.7)';
  const axisTickColorSubtle = isDarkTheme ? 'rgba(255,255,255,0.6)' : 'hsl(var(--bc) / 0.6)';
  const gridColor = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'hsl(var(--bc) / 0.15)';
  const strokePrimary = isDarkTheme ? '#ffffff' : 'hsl(var(--p))';
  const fillPrimary = isDarkTheme ? 'rgba(255,255,255,0.35)' : 'hsl(var(--p))';
  const avgConfigColor = isDarkTheme ? '#ffffff' : 'hsl(var(--p))';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-7">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-base-content/80">Growth Compass</div>
            <div className="text-[10px] text-base-content/60">Category mastery (avg score)</div>
          </div>
          {loadingDash ? (
            <div className="h-52 animate-pulse bg-base-300/50 rounded" />
          ) : summary?.learningPatterns?.categoryPerformance || summary?.problemsByCategory ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-52">
                {(() => {
                  const data = (summary?.learningPatterns?.categoryPerformance
                    ? Object.entries(summary.learningPatterns.categoryPerformance).map(([k,v]: any) => ({ subject: String(k), value: Number(v) }))
                    : Object.entries(summary?.problemsByCategory || {}).map(([k,v]: any) => ({ subject: String(k), value: Number(v?.averageScore || 0) }))
                  );
                  if (!data || data.length < 3 || data.every(d => !d.value)) {
                    return (
                      <div className="h-full w-full rounded-md border border-base-200/60 bg-base-100/40 flex items-center justify-center text-[11px] text-base-content/60">
                        Not enough categories to visualize. Solve a few across different areas to unlock the compass.
                      </div>
                    );
                  }
                  return (
                    <ChartContainer
                      config={{
                        avg: { label: 'Avg', color: avgConfigColor },
                      }}
                      className="h-full w-full"
                    >
                      <RadarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <PolarGrid gridType="circle" stroke={gridColor} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: axisTickColor }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: axisTickColorSubtle }} stroke={gridColor} />
                        <Radar name="Avg" dataKey="value" stroke={strokePrimary} fill={fillPrimary} fillOpacity={0.35} dot={{ r: 3, fill: strokePrimary, stroke: 'transparent' }} />
                        <ChartTooltip cursor={{ stroke: 'hsl(var(--bc) / 0.2)' }} content={<ChartTooltipContent />} />
                      </RadarChart>
                    </ChartContainer>
                  );
                })()}
              </div>
              <div className="text-xs text-base-content/70 space-y-2">
                <div className="text-[11px] text-base-content/60">Top categories</div>
                {((summary?.problemsByCategory ? Object.entries(summary.problemsByCategory) : []) as any)
                  .sort((a: any,b: any) => (b[1]?.totalPoints||0) - (a[1]?.totalPoints||0))
                  .slice(0,6)
                  .map(([k, v]: any) => (
                    <div key={String(k)} className="flex items-center justify-between py-1 border-b border-base-200/60">
                      <span className="capitalize truncate pr-2">{String(k).replace('-', ' ')}</span>
                      <span className="text-base-content/80">{v?.totalPoints || 0} pts · {v?.solved || 0} solved</span>
                    </div>
                ))}
                {!(summary?.problemsByCategory) && (
                  <div className="text-base-content/60">No category data yet.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-base-content/60">Not enough data to render the compass yet. Solve a few problems to unlock insights.</div>
          )}
        </DashboardCard>
      </div>
      <div className="xl:col-span-5">
        <DashboardCard variant="default" hoverEffect className="p-4">
          <div className="text-sm font-semibold text-base-content/80 mb-2">Momentum</div>
          {loadingDash ? (
            <div className="h-40 animate-pulse bg-base-300/50 rounded" />
          ) : Array.isArray(summary?.dailyStats) && summary.dailyStats.length > 0 ? (
            <div className="h-40">
              <ChartContainer
                config={{ points: { label: 'Points', color: 'hsl(var(--p))' } }}
                className="h-full w-full"
              >
                <AreaChart data={summary.dailyStats.slice(-30)} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDarkTheme ? '#ffffff' : 'hsl(var(--p))'} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={isDarkTheme ? '#ffffff' : 'hsl(var(--p))'} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisTickColor }} hide={summary.dailyStats.length > 14 ? true : false} />
                  <YAxis width={30} tick={{ fontSize: 10, fill: axisTickColor }} />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: 'hsl(var(--bc) / 0.2)' }} />
                  <Area type="monotone" dataKey="points" stroke={strokePrimary} fillOpacity={1} fill="url(#colorPts)" name="Points" />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="text-base-content/60 text-xs">
              No momentum data yet. Once you start solving, your 30-day points trend will appear here.
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}


