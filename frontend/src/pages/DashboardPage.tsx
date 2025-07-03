import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Trophy, ArrowRight, Smile } from 'lucide-react';
import { Particles } from '@/components/ui/Particles';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Welcome Section */}
      <motion.div 
        className="relative overflow-hidden glass bg-gradient-to-tr from-primary/80 to-accent/80 p-4 rounded-xl shadow border border-primary flex items-center gap-4 min-h-[100px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Particles className="z-0" quantity={60} color="#a5b4fc" />
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-base-100/80 shadow z-10">
          <Smile className="text-primary w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0 z-10">
          <h1 className="text-2xl font-extrabold text-primary-content font-heading truncate drop-shadow-sm">
            Welcome, {user?.firstName?.toUpperCase() || 'BUILDER'}!
          </h1>
          <p className="text-base-content/90 text-sm font-medium mt-1 flex items-center gap-2">
            <span className="badge badge-accent badge-sm align-middle">Zemon</span> journey update
          </p>
          <p className="text-base-content/70 text-xs mt-1 italic">Keep pushing forward, every step counts! 🚀</p>
        </div>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Learning Progress */}
        <div className="glass card p-4 rounded-lg border border-primary shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="text-primary w-4 h-4" />
            <span className="font-semibold text-primary text-sm">Learning</span>
            <span className="badge badge-info badge-xs ml-auto">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-primary">65%</p>
              <p className="text-base-content/70 text-xs">Frontend Path</p>
            </div>
            <div className="relative flex items-center justify-center h-12 w-12">
              <div className="radial-progress text-primary" style={{"--value":65,"--size":"3rem","--thickness":"6px"} as any}></div>
              <span className="absolute text-xs font-bold text-primary-content">65%</span>
            </div>
          </div>
        </div>
        
        {/* Problems Solved */}
        <div className="glass card p-4 rounded-lg border border-accent shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="text-accent w-4 h-4" />
            <span className="font-semibold text-accent text-sm">Solved</span>
            <span className="badge badge-success badge-xs ml-auto">+24</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-accent">24</p>
              <p className="text-base-content/70 text-xs">Last 30 days</p>
            </div>
            <div className="flex items-end h-10 space-x-0.5">
              {[3, 5, 2, 7, 4, 6, 8].map((value, index) => (
                <div 
                  key={index}
                  className="w-2 bg-accent rounded-t"
                  style={{ height: `${value * 5}px` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Ranking */}
        <div className="glass card p-4 rounded-lg border border-warning shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="text-warning w-4 h-4" />
            <span className="font-semibold text-warning text-sm">Ranking</span>
            <span className="badge badge-warning badge-xs ml-auto">Top 10%</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-warning">#42</p>
              <p className="text-base-content/70 text-xs">Top 10%</p>
            </div>
            <span className="badge badge-outline badge-warning text-xs font-semibold">10%</span>
          </div>
        </div>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div
        className="glass card bg-base-100 p-4 rounded-lg border border-base-300 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-base font-bold text-primary font-heading mb-2 flex items-center gap-1">
          <Sparkles className="text-primary w-4 h-4" /> Activity
        </h2>
        <div className="space-y-2">
          {[
            { 
              title: 'Completed React Hooks Tutorial', 
              category: 'Forge',
              time: '2h ago',
              icon: '🔨',
              badge: 'info'
            },
            { 
              title: 'Solved "Binary Tree Traversal"', 
              category: 'Crucible',
              time: 'Yesterday',
              icon: '🧪',
              badge: 'success'
            },
            { 
              title: 'Participated in Weekly Challenge', 
              category: 'Arena',
              time: '3d ago',
              icon: '⚔️',
              badge: 'warning'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center p-2 rounded hover:bg-base-200 transition-colors gap-2">
              <div className="h-8 w-8 rounded-full bg-base-200 flex items-center justify-center text-lg">
                {activity.icon}
              </div>
              <div className="ml-2 flex-1 min-w-0">
                <p className="font-medium text-base-content truncate">{activity.title}</p>
                <p className="text-base-content/60 text-xs truncate">{activity.category} • {activity.time}</p>
              </div>
              <span className={`badge badge-${activity.badge} badge-outline`}>{activity.category}</span>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Recommended Next Steps */}
      <motion.div
        className="glass card bg-gradient-to-tr from-primary/10 to-accent/10 p-4 rounded-lg border border-base-300 shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-base font-bold text-primary font-heading mb-2 flex items-center gap-1">
          <ArrowRight className="text-primary w-4 h-4" /> Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-3 border border-primary rounded bg-base-100 flex flex-col gap-1 shadow-sm">
            <h3 className="font-semibold text-primary text-sm">Continue Frontend Path</h3>
            <p className="text-base-content/70 text-xs mb-2">Resume where you left off in the React course</p>
            <button className="btn btn-primary btn-xs w-fit">Continue</button>
          </div>
          <div className="p-3 border border-accent rounded bg-base-100 flex flex-col gap-1 shadow-sm">
            <h3 className="font-semibold text-accent text-sm">Weekly Coding Challenge</h3>
            <p className="text-base-content/70 text-xs mb-2">New challenge available in the Arena</p>
            <button className="btn btn-accent btn-xs w-fit">View</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}