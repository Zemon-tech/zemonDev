import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'How to Get the Most Out of Zemon',
    summary: 'Tips and tricks for maximizing your learning and growth on the Zemon platform.',
    date: '2024-06-01',
    author: 'Team Zemon',
    image: '/public/arena.jpg',
    link: '#',
  },
  {
    id: 2,
    title: 'Building Real-World Projects as a Student',
    summary: 'Why project-based learning is the best way to prepare for your tech career.',
    date: '2024-05-20',
    author: 'Team Zemon',
    image: '/public/forge.jpg',
    link: '#',
  },
  {
    id: 3,
    title: 'Competing in Coding Arenas: What to Expect',
    summary: 'A guide to Zemon’s Arena and how to climb the leaderboard.',
    date: '2024-05-10',
    author: 'Team Zemon',
    image: '/public/crucible.jpg',
    link: '#',
  },
];

export default function BlogsPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-primary font-heading mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Zemon Blog
      </motion.h1>
      <motion.p
        className="text-lg text-text-secondary mb-12 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Insights, tips, and stories from the Zemon community and team.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <motion.div
            key={post.id}
            className="rounded-lg overflow-hidden shadow-lg bg-background-secondary border border-border flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img src={post.image} alt={post.title} className="h-48 w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-primary font-heading mb-2">{post.title}</h2>
              <p className="text-text-secondary mb-4 flex-1">{post.summary}</p>
              <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                <span>{post.author}</span>
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <Link to={post.link} className="btn btn-primary btn-sm mt-auto w-full">Read More</Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 