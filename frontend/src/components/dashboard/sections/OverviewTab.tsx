import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
// import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export function OverviewTab({
  loadingDash,
  errorDash,
  nextUp,
  onNextUpAction,
  onRecompute,
  isRefreshing,
  summary,
  DashboardStatsRow,
}: {
  loadingDash: boolean;
  errorDash: string | null;
  nextUp: any;
  onNextUpAction: () => void;
  onRecompute: () => Promise<void> | void;
  isRefreshing: boolean;
  summary: any;
  DashboardStatsRow: React.ComponentType;
}) {
  return (
    <div className="flex flex-col gap-4">
      <DashboardCard variant="default" hoverEffect className="p-4">
        {loadingDash ? (
          <div className="h-10 animate-pulse bg-base-300/50 rounded" />
        ) : errorDash ? (
          <div className="text-error text-sm">{errorDash}</div>
        ) : nextUp ? (
          <div className="relative overflow-hidden rounded-lg">
            <div className="absolute -inset-px opacity-[0.6] pointer-events-none bg-[radial-gradient(1200px_300px_at_0%_0%,hsl(var(--primary)/0.06),transparent),radial-gradient(900px_300px_at_100%_0%,hsl(var(--accent)/0.06),transparent)]" />
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-9 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-base-content/70">Today’s Focus</span>
                  {nextUp?.type && (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {String(nextUp.type).replace('_',' ')}
                    </Badge>
                  )}
                  {Array.isArray(nextUp.tags) && nextUp.tags.length > 0 && (
                    <div className="hidden md:flex items-center gap-1 flex-wrap">
                      {nextUp.tags.slice(0,3).map((t: string, i: number) => (
                        <Badge key={i} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-lg font-bold leading-tight truncate">{nextUp.title}</div>
                    <div className="text-sm text-base-content/70 line-clamp-2">{nextUp.description}</div>
                  </div>
                </div>
                {Array.isArray(nextUp.tags) && nextUp.tags.length > 0 && (
                  <div className="flex md:hidden flex-wrap gap-1 pt-2">
                    {nextUp.tags.slice(0,3).map((t: string, i: number) => (
                      <Badge key={i} variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-3 flex md:justify-end gap-2">
                <button className="btn btn-ghost btn-xs" onClick={onRecompute} disabled={isRefreshing}>
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={onNextUpAction}>
                  {nextUp?.action?.kind === 'open_bookmarks' ? 'View Resources' : 'Start Challenge'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-base-content/70">No recommendation available.</div>
        )}
      </DashboardCard>

      <DashboardStatsRow />

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
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <PolarGrid gridType="circle" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar name="Avg" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} dot={{ r: 3, fill: 'hsl(var(--primary))', stroke: 'transparent' }} />
                        </RadarChart>
                      </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.dailyStats.slice(-30)} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--p))" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="hsl(var(--p))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bc) / 0.15)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} hide={summary.dailyStats.length > 14 ? true : false} />
                    <YAxis width={30} tick={{ fontSize: 10 }} />
                    <ReTooltip contentStyle={{ background: 'hsl(var(--b1))', border: '1px solid hsl(var(--bc) / 0.15)' }} />
                    <Area type="monotone" dataKey="points" stroke="hsl(var(--p))" fillOpacity={1} fill="url(#colorPts)" name="Points" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-base-content/60 text-xs">
                No momentum data yet. Once you start solving, your 30-day points trend will appear here.
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}


