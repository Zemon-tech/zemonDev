import { motion } from 'framer-motion';

const team = [
  {
    name: 'Shivang Kandoi',
    role: 'Founder & Lead Engineer',
    image: '/public/arena.jpg',
    bio: 'Passionate about empowering students to learn and build. Loves AI, open source, and hackathons.'
  },
  // Add more team members as needed
];

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-primary font-heading mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About Zemon
      </motion.h1>
      <motion.p
        className="text-lg text-text-secondary mb-12 text-center max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Zemon is the ultimate platform for college students to learn, build, and showcase their programming skills. Our mission is to empower the next generation of builders through real-world projects, coding competitions, and a vibrant community.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <motion.div
          className="bg-background-secondary rounded-lg shadow-lg p-8 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-primary font-heading mb-4">Our Vision</h2>
          <p className="text-text-secondary">
            We believe every student should have access to world-class resources, mentorship, and opportunities to build real projects. Zemon is designed to bridge the gap between learning and doing, helping you become a confident, job-ready developer.
          </p>
        </motion.div>
        <motion.div
          className="bg-background-secondary rounded-lg shadow-lg p-8 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-primary font-heading mb-4">What Makes Us Different?</h2>
          <ul className="list-disc ml-6 text-text-secondary space-y-2">
            <li>Project-based learning and real-world challenges</li>
            <li>AI-powered feedback and personalized growth</li>
            <li>Active, supportive community and mentorship</li>
            <li>Opportunities to compete, collaborate, and get noticed</li>
          </ul>
        </motion.div>
      </div>
      <motion.h2
        className="text-3xl font-bold text-primary font-heading mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Meet the Team
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-8">
        {team.map(member => (
          <motion.div
            key={member.name}
            className="flex flex-col items-center bg-background-secondary rounded-lg shadow-lg p-6 border border-border w-72"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary" />
            <h3 className="text-xl font-bold text-primary font-heading mb-1">{member.name}</h3>
            <p className="text-text-secondary mb-2">{member.role}</p>
            <p className="text-text-secondary text-sm text-center">{member.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 