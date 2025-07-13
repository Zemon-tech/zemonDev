import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Image, Gift, Smile, User, Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  timestamp: Date;
  reactions: {
    emoji: string;
    count: number;
    reacted: boolean;
  }[];
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface ChatChannelProps {
  channelName: string;
  description?: string;
}

const ChatChannel: React.FC<ChatChannelProps> = ({ channelName, description }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey everyone! Welcome to the channel 👋\nFeel free to introduce yourself and share what you\'re working on!',
      author: {
        name: 'CodeMaster',
        avatar: 'https://github.com/shadcn.png',
        role: 'Admin'
      },
      timestamp: new Date(),
      reactions: [
        { emoji: '👋', count: 3, reacted: true },
        { emoji: '❤️', count: 2, reacted: false },
      ],
      attachments: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb',
          name: 'welcome-banner.jpg'
        }
      ]
    },
    {
      id: '2',
      content: 'Hi everyone! I\'m working on a new React project using Next.js and Tailwind. Looking forward to sharing my progress!',
      author: {
        name: 'TechNinja',
        avatar: 'https://github.com/shadcn.png',
        role: 'Member'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      reactions: [
        { emoji: '🚀', count: 2, reacted: false },
        { emoji: '👍', count: 1, reacted: true },
      ]
    }
  ]);
  const [messageInput, setMessageInput] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-300 bg-base-200">
        <div>
          <h2 className="text-lg font-semibold text-base-content">#{channelName}</h2>
          {description && (
            <p className="text-sm text-base-content/70">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="text-base-content/70 hover:text-base-content">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group px-4 py-2 -mx-4 hover:bg-base-200 rounded-lg",
                "transition-colors duration-200"
              )}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  {message.author.avatar ? (
                    <AvatarImage src={message.author.avatar} alt={message.author.name} />
                  ) : (
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base-content">{message.author.name}</span>
                    <span className="text-xs text-base-content/70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-base-content/80 mt-1 whitespace-pre-line">{message.content}</p>
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden">
                          {attachment.type === 'image' && (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="max-w-md rounded-lg border border-base-300"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex gap-1">
                      {message.reactions.map((reaction, idx) => (
                        <button
                          key={idx}
                          className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            "flex items-center gap-1",
                            "transition-colors duration-200",
                            reaction.reacted
                              ? "bg-primary/20 text-primary"
                              : "bg-base-300 hover:bg-base-300/80 text-base-content/70"
                          )}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-base-300 bg-base-200">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Image className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Message #${channelName}`}
            className={cn(
              "w-full bg-base-300 rounded-lg pl-24 pr-24 py-3",
              "text-base-content placeholder:text-base-content/60",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Gift className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-base-300 text-base-content/70 hover:text-base-content transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatChannel; 