import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        className="bg-background-secondary p-6 rounded-2xl border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-primary font-heading">
          Welcome back, {user?.firstName || 'Builder'}!
        </h1>
        <p className="mt-2 text-text-secondary">
          Here's what's happening in your Zemon journey today.
        </p>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Learning Progress */}
        <div className="bg-background p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold text-primary font-heading mb-2">Learning Progress</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">65%</p>
              <p className="text-text-secondary text-sm">Frontend Path</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/40 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Problems Solved */}
        <div className="bg-background p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold text-primary font-heading mb-2">Problems Solved</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">24</p>
              <p className="text-text-secondary text-sm">Last 30 days</p>
            </div>
            <div className="flex items-end h-16 space-x-1">
              {[3, 5, 2, 7, 4, 6, 8].map((value, index) => (
                <div 
                  key={index}
                  className="w-3 bg-primary rounded-t"
                  style={{ height: `${value * 8}px` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Ranking */}
        <div className="bg-background p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold text-primary font-heading mb-2">Arena Ranking</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">#42</p>
              <p className="text-text-secondary text-sm">Top 10%</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-accent/40 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                  10%
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div
        className="bg-background p-6 rounded-2xl border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-primary font-heading mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { 
              title: 'Completed React Hooks Tutorial', 
              category: 'Forge',
              time: '2 hours ago',
              icon: '🔨'
            },
            { 
              title: 'Solved "Binary Tree Traversal"', 
              category: 'Crucible',
              time: 'Yesterday',
              icon: '🧪'
            },
            { 
              title: 'Participated in Weekly Challenge', 
              category: 'Arena',
              time: '3 days ago',
              icon: '⚔️'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-center p-3 rounded-lg hover:bg-background-secondary transition-colors">
              <div className="h-10 w-10 rounded-full bg-background-secondary flex items-center justify-center text-xl">
                {activity.icon}
              </div>
              <div className="ml-4">
                <p className="font-medium">{activity.title}</p>
                <p className="text-text-secondary text-sm">{activity.category} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Recommended Next Steps */}
      <motion.div
        className="bg-background p-6 rounded-2xl border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-xl font-bold text-primary font-heading mb-4">Recommended Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-border rounded-xl bg-background-secondary">
            <h3 className="font-bold">Continue Frontend Path</h3>
            <p className="text-text-secondary text-sm mb-3">Resume where you left off in the React course</p>
            <button className="btn btn-primary btn-sm">Continue Learning</button>
          </div>
          <div className="p-4 border border-border rounded-xl bg-background-secondary">
            <h3 className="font-bold">Weekly Coding Challenge</h3>
            <p className="text-text-secondary text-sm mb-3">New challenge available in the Arena</p>
            <button className="btn btn-primary btn-sm">View Challenge</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}