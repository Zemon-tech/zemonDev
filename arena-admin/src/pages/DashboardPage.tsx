import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api.service';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

interface Stats {
  channels: number;
  messages: number;
  showcases: number;
  hackathons: number;
  activeHackathons: number;
}

interface Channel {
  _id: string;
  name: string;
  description?: string;
  group: string;
}

interface ChannelsResponse {
  [category: string]: Channel[];
}

interface MessagesResponse {
  messages: any[];
  pagination: {
    page: number;
    limit: number;
  };
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    channels: 0,
    messages: 0,
    showcases: 0,
    hackathons: 0,
    activeHackathons: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get channels
        const channelsData = await ApiService.getChannels() as ChannelsResponse;
        
        // Count total channels
        let channelsCount = 0;
        for (const category in channelsData) {
          if (Object.prototype.hasOwnProperty.call(channelsData, category)) {
            if (Array.isArray(channelsData[category])) {
              channelsCount += channelsData[category].length;
            }
          }
        }
        
        // Get current hackathon
        let currentHackathon;
        try {
          currentHackathon = await ApiService.getCurrentHackathon();
        } catch (err) {
          console.warn('Could not fetch current hackathon:', err);
        }
        
        // Get hackathon history
        let hackathonsHistory: any[] = [];
        try {
          const historyData = await ApiService.getHackathons() as any[];
          if (Array.isArray(historyData)) {
            hackathonsHistory = historyData;
          }
        } catch (err) {
          console.warn('Could not fetch hackathon history:', err);
        }
        
        // Get showcases
        let showcases: any[] = [];
        try {
          const showcasesData = await ApiService.getShowcases() as any[];
          if (Array.isArray(showcasesData)) {
            showcases = showcasesData;
          }
        } catch (err) {
          console.warn('Could not fetch showcases:', err);
        }
        
        // Get total messages count (across all channels)
        let messagesCount = 0;
        try {
          messagesCount = await ApiService.getTotalMessagesCount();
        } catch (err) {
          console.warn('Could not fetch total messages count:', err);
        }

        setStats({
          channels: channelsCount,
          messages: messagesCount,
          showcases: showcases.length,
          hackathons: hackathonsHistory.length,
          activeHackathons: currentHackathon ? 1 : 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stat card component
  const StatCard = ({ title, value, link }: { title: string; value: number; link: string }) => (
    <Link to={link} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <h3 className="font-medium text-gray-700">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Arena Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Channels" value={stats.channels} link="/channels" />
        <StatCard title="Messages" value={stats.messages} link="/channels" />
        <StatCard title="Showcases" value={stats.showcases} link="/showcase" />
        <StatCard title="Hackathons" value={stats.hackathons} link="/hackathons" />
        <StatCard title="Active Hackathons" value={stats.activeHackathons} link="/hackathons" />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/channels"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center"
          >
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Manage Channels</h3>
              <p className="text-sm text-gray-600">Create, edit, or delete channels</p>
            </div>
          </Link>
          
          <Link
            to="/hackathons"
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex items-center"
          >
            <div className="bg-purple-100 p-2 rounded-full mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Manage Hackathons</h3>
              <p className="text-sm text-gray-600">View hackathon history</p>
            </div>
          </Link>

          <Link
            to="/showcase"
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex items-center"
          >
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">View Showcases</h3>
              <p className="text-sm text-gray-600">Browse project showcases</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 