import { AchievementBadgesCard } from '@/components/dashboard/AchievementBadgesCard';
import { SkillBreakdownCard } from '@/components/dashboard/SkillBreakdownCard';

export function ActivityTab({
  scoringData,
  scoringLoading,
  DashboardLeaderboard,
}: {
  scoringData: any;
  scoringLoading: boolean;
  DashboardLeaderboard: React.ComponentType;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-3 flex flex-col">
        <DashboardLeaderboard />
      </div>
      <div className="xl:col-span-4 flex flex-col">
        <SkillBreakdownCard scoringData={scoringData || undefined} loading={scoringLoading} />
      </div>
      <div className="xl:col-span-5 flex flex-col">
        <AchievementBadgesCard scoringData={scoringData || undefined} loading={scoringLoading} />
      </div>
    </div>
  );
}


