import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/blocks/Timeline';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GradientText } from '@/components/blocks/GradientText';
import { 
  MessageSquare, 
  Trophy, 
  Users, 
  Code, 
  Rocket,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';

const StartHereChannel: React.FC = () => {
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

  // Getting started steps
  const steps = [
    'Join the community channels and introduce yourself',
    'Check out the weekly challenges in the Hackathons section',
    'Share your projects in the Showcase channel',
    'Participate in discussions and help others'
  ];

  // Features section data
  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Community Channels',
      description: 'Connect with fellow developers in topic-focused channels'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: 'Weekly Challenges',
      description: 'Test your skills with our weekly coding challenges'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Project Showcase',
      description: 'Share your projects and get feedback from the community'
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'Code Reviews',
      description: 'Get and give constructive feedback on code'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-12 py-6">
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <GradientText text="Welcome to the Arena!" className="text-4xl font-bold" />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your space to connect, learn, and grow with fellow developers.
              Let's get you started on your journey!
            </p>
          </motion.div>

          {/* Quick Start Guide */}
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Rocket className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-semibold">Quick Start Guide</h2>
                </div>
                <Timeline items={steps} />
                <Button className="mt-4 gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-xl border bg-card/50",
                  "hover:bg-card/80 transition-colors duration-200"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Learning Paths */}
          <motion.div variants={itemVariants}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Learning Paths</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LearningPath
                  icon={<Target className="w-5 h-5" />}
                  title="Beginner"
                  description="Start with the basics and build a strong foundation"
                  skills={['HTML/CSS', 'JavaScript', 'Git Basics']}
                />
                <LearningPath
                  icon={<Code className="w-5 h-5" />}
                  title="Intermediate"
                  description="Dive deeper into modern development practices"
                  skills={['React', 'Node.js', 'APIs']}
                />
                <LearningPath
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Advanced"
                  description="Master complex concepts and architectures"
                  skills={['System Design', 'Cloud Services', 'Performance']}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Learning Path Component
interface LearningPathProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  skills: string[];
}

const LearningPath: React.FC<LearningPathProps> = ({
  icon,
  title,
  description,
  skills
}) => {
  return (
    <div className={cn(
      "p-6 rounded-xl border bg-card/50",
      "hover:bg-card/80 transition-colors duration-200"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Key Skills:</h4>
        <ul className="space-y-1">
          {skills.map((skill, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StartHereChannel; 