import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Info } from 'lucide-react';
import { Channel } from '@/hooks/useArenaChannels';

interface ParentChannelDetailsProps {
  channel: Channel;
  subChannels: Channel[];
}

const ParentChannelDetails: React.FC<ParentChannelDetailsProps> = ({
  channel,
  subChannels,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Format channel name for display (capitalize first letter of each word)
  const formatChannelName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold text-base-content mb-4">
              Welcome to {formatChannelName(channel.name)}
            </h1>
          </motion.div>

          {/* Description Section */}
          {channel.description && (
            <motion.div variants={itemVariants} className="bg-base-200 rounded-lg p-6">
              <p className="text-base-content/80 text-lg leading-relaxed">
                {channel.description}
              </p>
            </motion.div>
          )}

          {/* Sub-channels Section */}
          {subChannels.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h2 className="text-2xl font-semibold text-base-content mb-6">
                Channel Information
              </h2>
              
              <div className="grid gap-4">
                {subChannels.map((subChannel) => (
                  <motion.div
                    key={subChannel._id}
                    variants={itemVariants}
                    className="bg-base-200 rounded-lg p-6 border border-base-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <Hash className="w-5 h-5 text-base-content/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-base-content">
                            {formatChannelName(subChannel.name)}
                          </h3>
                          {subChannel.type === 'announcement' && (
                            <span className="badge badge-primary badge-sm">Announcement</span>
                          )}
                          {subChannel.type === 'showcase' && (
                            <span className="badge badge-secondary badge-sm">Showcase</span>
                          )}
                          {subChannel.type === 'chat' && (
                            <span className="badge badge-accent badge-sm">Chat</span>
                          )}
                        </div>
                        {subChannel.description ? (
                          <p className="text-base-content/70 leading-relaxed">
                            {subChannel.description}
                          </p>
                        ) : (
                          <p className="text-base-content/50 italic">
                            No description available
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {subChannels.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-12">
              <Info className="w-12 h-12 text-base-content/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content/60 mb-2">
                No Sub-channels
              </h3>
              <p className="text-base-content/50">
                This channel doesn't have any sub-channels yet.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentChannelDetails; 