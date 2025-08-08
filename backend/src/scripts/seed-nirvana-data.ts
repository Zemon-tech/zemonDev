import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { NirvanaHackathon, NirvanaNews, NirvanaTool } from '../models';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const seedNirvanaData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Get a user ID for creating items (you'll need to replace this with an actual user ID)
    const userId = new mongoose.Types.ObjectId(); // Replace with actual user ID

    // Clear existing data
    await NirvanaHackathon.deleteMany({});
    await NirvanaNews.deleteMany({});
    await NirvanaTool.deleteMany({});
    console.log('Cleared existing Nirvana data');

    // Seed Hackathons
    const hackathons = [
      {
        title: '🚀 AI Innovation Hackathon 2024',
        content: 'Join our biggest hackathon yet! Build AI-powered solutions and compete for $50,000 in prizes.',
        description: 'A comprehensive hackathon focused on AI and machine learning innovations',
        prize: '$50,000',
        participants: 250,
        category: 'AI/ML',
        tags: ['AI', 'Machine Learning', 'Innovation'],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        status: 'active' as const,
        isPinned: true,
        isVerified: true,
        priority: 'high' as const,
        createdBy: userId,
        reactions: {
          likes: 89,
          shares: 23,
          bookmarks: 45
        },
        metadata: {
          hackathonName: 'AI Innovation 2024',
          link: '#',
          image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
        }
      },
      {
        title: '🌱 Green Tech Challenge',
        content: 'Build sustainable solutions for a better future. Focus on renewable energy and environmental conservation.',
        description: 'Sustainability-focused hackathon for environmental solutions',
        prize: '$25,000',
        participants: 180,
        category: 'Sustainability',
        tags: ['Green Tech', 'Sustainability', 'Environment'],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
        status: 'upcoming' as const,
        isPinned: false,
        isVerified: true,
        priority: 'medium' as const,
        createdBy: userId,
        reactions: {
          likes: 45,
          shares: 12,
          bookmarks: 23
        },
        metadata: {
          hackathonName: 'Green Tech Challenge',
          link: '#',
          image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400'
        }
      }
    ];

    await NirvanaHackathon.insertMany(hackathons);
    console.log('✅ Seeded hackathons');

    // Seed News
    const news = [
      {
        title: '🎉 Community Milestone: 10,000 Members!',
        content: 'We\'ve reached 10,000 active developers in our community! Thank you for being part of this amazing journey.',
        category: 'Community Milestone',
        tags: ['Milestone', 'Community', 'Growth'],
        isPinned: true,
        isVerified: true,
        priority: 'high' as const,
        createdBy: userId,
        reactions: {
          likes: 234,
          shares: 89,
          bookmarks: 67
        },
        metadata: {
          progress: 100,
          link: '#',
          image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400'
        }
      },
      {
        title: '📈 New Learning Paths Available',
        content: 'We\'ve added comprehensive learning paths for React, Node.js, and Python. Start your journey today!',
        category: 'Platform Update',
        tags: ['Learning', 'React', 'Node.js', 'Python'],
        isPinned: false,
        isVerified: true,
        priority: 'medium' as const,
        createdBy: userId,
        reactions: {
          likes: 156,
          shares: 45,
          bookmarks: 89
        },
        metadata: {
          progress: 75,
          link: '#',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
        }
      }
    ];

    await NirvanaNews.insertMany(news);
    console.log('✅ Seeded news');

    // Seed Tools
    const tools = [
      {
        title: '🛠️ New Tool: CodeGPT Assistant',
        content: 'Introducing our AI-powered code assistant. Get instant help with debugging, refactoring, and code reviews.',
        toolName: 'CodeGPT Assistant',
        category: 'Development Tools',
        tags: ['AI', 'Code Assistant', 'Productivity'],
        rating: 4.9,
        views: 890,
        isPinned: true,
        isVerified: true,
        priority: 'high' as const,
        createdBy: userId,
        reactions: {
          likes: 234,
          shares: 89,
          bookmarks: 123
        },
        metadata: {
          link: '#',
          image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
        }
      },
      {
        title: '🎨 Design System Builder',
        content: 'Create consistent design systems with our new visual builder. Perfect for teams and large projects.',
        toolName: 'Design System Builder',
        category: 'Design Tools',
        tags: ['Design', 'UI/UX', 'System'],
        rating: 4.7,
        views: 567,
        isPinned: false,
        isVerified: true,
        priority: 'medium' as const,
        createdBy: userId,
        reactions: {
          likes: 123,
          shares: 34,
          bookmarks: 67
        },
        metadata: {
          link: '#',
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
        }
      }
    ];

    await NirvanaTool.insertMany(tools);
    console.log('✅ Seeded tools');

    console.log('🎉 All Nirvana data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Nirvana data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed script
seedNirvanaData();
