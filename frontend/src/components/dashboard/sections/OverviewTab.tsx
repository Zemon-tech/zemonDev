import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { AchievementBadgesCard } from '@/components/dashboard/AchievementBadgesCard';
import { SkillBreakdownCard } from '@/components/dashboard/SkillBreakdownCard';
import { DashboardLeaderboard } from '@/components/dashboard/DashboardLeaderboard';

export function OverviewTab({
  loadingDash,
  errorDash,
  nextUp,
  onNextUpAction,
  onRecompute,
  isRefreshing,
  DashboardStatsRow,
  scoringData,
  scoringLoading,
}: {
  loadingDash: boolean;
  errorDash: string | null;
  nextUp: any;
  onNextUpAction: () => void;
  onRecompute: () => Promise<void> | void;
  isRefreshing: boolean;
  DashboardStatsRow: React.ComponentType;
  scoringData: any;
  scoringLoading: boolean;
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
                  <span className="font-semibold text-base-content/70">Today's Focus</span>
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
        <div className="xl:col-span-5 flex flex-col">
          <DashboardLeaderboard limit={5} />
        </div>
        <div className="xl:col-span-3 flex flex-col">
          <SkillBreakdownCard scoringData={scoringData || undefined} loading={scoringLoading} />
        </div>
        <div className="xl:col-span-4 flex flex-col">
          <AchievementBadgesCard scoringData={scoringData || undefined} loading={scoringLoading} />
        </div>
      </div>
    </div>
  );
}


