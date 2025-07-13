import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Shield,
  Users,
  Code,
  GitBranch,
  FileCode,
  MessageSquare
} from 'lucide-react';

interface Rule {
  id: string;
  title: string;
  description: string;
  type: 'important' | 'do' | 'dont';
  icon: React.ReactNode;
  examples?: {
    good?: string[];
    bad?: string[];
  };
}

const HackathonRules: React.FC = () => {
  // Mock rules data
  const rules: Rule[] = [
    {
      id: '1',
      title: 'Time Constraints',
      description: 'Each challenge runs for exactly 7 days. Late submissions will not be accepted. You can submit multiple times during the challenge period.',
      type: 'important',
      icon: <Clock className="w-5 h-5" />,
      examples: {
        good: [
          'Submit before the deadline',
          'Use time management tools',
          'Plan your development phases'
        ],
        bad: [
          'Start at the last minute',
          'Request deadline extensions',
          'Submit incomplete work'
        ]
      }
    },
    {
      id: '2',
      title: 'Scoring System',
      description: 'Projects are scored based on code quality (40%), feature completeness (30%), innovation (20%), and documentation (10%).',
      type: 'important',
      icon: <Trophy className="w-5 h-5" />,
      examples: {
        good: [
          'Write clean, maintainable code',
          'Implement all required features',
          'Add comprehensive documentation'
        ]
      }
    },
    {
      id: '3',
      title: 'Code Originality',
      description: 'All code must be original and written during the challenge period. You can use open-source libraries but must credit them.',
      type: 'important',
      icon: <Shield className="w-5 h-5" />,
      examples: {
        good: [
          'Write your own implementation',
          'Credit used libraries',
          'Document external resources'
        ],
        bad: [
          'Copy code from other submissions',
          'Use pre-built solutions',
          'Submit old projects'
        ]
      }
    },
    {
      id: '4',
      title: 'Collaboration',
      description: 'While challenges are individual, you can discuss approaches and share resources in the community channels.',
      type: 'do',
      icon: <Users className="w-5 h-5" />,
      examples: {
        good: [
          'Share learning resources',
          'Discuss general approaches',
          'Help debug issues'
        ],
        bad: [
          'Share solution code',
          'Work on submissions together',
          'Copy others\' implementations'
        ]
      }
    },
    {
      id: '5',
      title: 'Code Quality',
      description: 'Write clean, well-documented code following best practices. Include tests and error handling.',
      type: 'do',
      icon: <Code className="w-5 h-5" />,
      examples: {
        good: [
          'Use consistent formatting',
          'Write meaningful comments',
          'Handle edge cases'
        ]
      }
    },
    {
      id: '6',
      title: 'Version Control',
      description: 'Use Git for version control and maintain a clean commit history showing your development process.',
      type: 'do',
      icon: <GitBranch className="w-5 h-5" />,
      examples: {
        good: [
          'Make regular commits',
          'Write clear commit messages',
          'Use feature branches'
        ]
      }
    },
    {
      id: '7',
      title: 'Documentation',
      description: 'Include a README with setup instructions, features overview, and technical decisions.',
      type: 'do',
      icon: <FileCode className="w-5 h-5" />,
      examples: {
        good: [
          'Clear setup instructions',
          'Features documentation',
          'Architecture overview'
        ]
      }
    },
    {
      id: '8',
      title: 'Community Guidelines',
      description: 'Maintain a positive and supportive environment. No harassment or disrespectful behavior.',
      type: 'dont',
      icon: <MessageSquare className="w-5 h-5" />,
      examples: {
        bad: [
          'Criticize others\' work harshly',
          'Make discriminatory comments',
          'Spam in discussion channels'
        ]
      }
    }
  ];

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

  // Helper function to get rule icon
  const getRuleIcon = (type: Rule['type']) => {
    switch (type) {
      case 'do':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'dont':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'important':
        return <AlertCircle className="w-5 h-5 text-primary" />;
    }
  };

  // Helper function to get rule styles
  const getRuleStyles = (type: Rule['type']) => {
    switch (type) {
      case 'do':
        return 'border-green-100 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10';
      case 'dont':
        return 'border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10';
      case 'important':
        return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Channel Header */}
      <div>
        <h1 className="text-2xl font-bold">Hackathon Rules</h1>
        <p className="text-muted-foreground">
          Guidelines for participating in weekly challenges
        </p>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {rules.map(rule => (
          <motion.div
            key={rule.id}
            variants={itemVariants}
            className={cn(
              "p-6 rounded-xl border",
              getRuleStyles(rule.type)
            )}
          >
            {/* Rule Header */}
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-background/50">
                {rule.icon}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {getRuleIcon(rule.type)}
                  <h3 className="text-lg font-semibold">{rule.title}</h3>
                </div>
                <p className="text-muted-foreground">{rule.description}</p>
              </div>
            </div>

            {/* Examples */}
            {rule.examples && (
              <div className="mt-4 pl-12 space-y-4">
                {rule.examples.good && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                      Good Practices:
                    </h4>
                    <ul className="space-y-1">
                      {rule.examples.good.map((example, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rule.examples.bad && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                      What to Avoid:
                    </h4>
                    <ul className="space-y-1">
                      {rule.examples.bad.map((example, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HackathonRules; 