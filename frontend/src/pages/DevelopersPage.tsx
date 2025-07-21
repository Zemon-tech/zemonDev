import { motion } from 'framer-motion';

const features = [
  {
    title: 'API Access',
    description: 'Integrate Zemon with your own tools and workflows using our RESTful API.',
    icon: '🛠️',
  },
  {
    title: 'Open Source SDKs',
    description: 'Use our open-source SDKs to build custom integrations and apps.',
    icon: '📦',
  },
  {
    title: 'Webhooks',
    description: 'Receive real-time updates about events in your workspace.',
    icon: '🔔',
  },
  {
    title: 'Developer Community',
    description: 'Join our Discord and GitHub to collaborate, share, and get support.',
    icon: '💬',
  },
];

export default function DevelopersPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-primary font-heading mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        For Developers
      </motion.h1>
      <motion.p
        className="text-lg text-text-secondary mb-12 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Build, extend, and integrate with Zemon. Explore our developer resources and join the community.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(f => (
          <motion.div
            key={f.title}
            className="rounded-lg shadow-lg border border-border bg-background-secondary p-8 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-5xl mb-4">{f.icon}</div>
            <h2 className="text-xl font-bold text-primary font-heading mb-2">{f.title}</h2>
            <p className="text-text-secondary">{f.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a href="https://github.com/zemon-community" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg mr-4">GitHub</a>
        <a href="https://discord.gg/zemon" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Join Discord</a>
      </div>
    </div>
  );
} 