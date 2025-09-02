import { DashboardCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export function TodoTab() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <DashboardCard variant="default" hoverEffect className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-base-content/80">Todo & Queue</div>
          <Badge variant="outline" className="text-[10px]">Personalized</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-3">
            <div className="text-xs font-medium">Difficulty</div>
            <select className="select select-bordered select-xs w-full">
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="text-xs font-medium">Time ≤ minutes</div>
            <Slider defaultValue={[20]} max={60} step={5} className="w-full" />
            <div className="flex items-center gap-2 text-xs"><Switch id="streak" /><label htmlFor="streak">Only streak-savers</label></div>
          </div>
          <div className="lg:col-span-3">
            <div className="text-xs text-base-content/60 mb-2">Interactive data table placeholder</div>
            <div className="rounded-md border border-base-200/60 p-3 text-xs text-base-content/70 bg-base-100/60">
              Use shadcn Data Table here (sortable, filterable).
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}


