import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Rule {
  id: string;
  title: string;
  description: string;
  type: 'do' | 'dont' | 'important';
  examples?: {
    good?: string[];
    bad?: string[];
  };
}

const RulesChannel: React.FC = () => {
  // Mock rules data
  const rules: Rule[] = [
    {
      id: '1',
      title: 'Be Respectful',
      description: 'Treat all community members with respect. No harassment, hate speech, or discriminatory behavior.',
      type: 'important',
      examples: {
        good: [
          'I disagree with your approach because...',
          'Have you considered trying...'
        ],
        bad: [
          'Your code is terrible',
          'That\'s a stupid solution'
        ]
      }
    },
    {
      id: '2',
      title: 'Share Knowledge',
      description: 'Help others learn by sharing your knowledge and experience. Explain your solutions and provide constructive feedback.',
      type: 'do',
      examples: {
        good: [
          'Here\'s how I solved a similar problem...',
          'The pattern you might want to look into is...'
        ]
      }
    },
    {
      id: '3',
      title: 'No Spam',
      description: 'Don\'t spam the channels with repetitive messages, advertisements, or irrelevant content.',
      type: 'dont',
      examples: {
        bad: [
          'Check out my new product at...',
          'Anyone want to buy...'
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



  return (
    <div className="flex-1 overflow-y-auto">
      {/* Channel Header */}
      <div className="flex items-center justify-between h-9 px-4 py-1 border-b border-base-300 bg-base-200 sticky top-0 z-10">
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-base-content">Community Rules</h2>
          <p className="text-[10px] text-base-content/70">Guidelines to ensure a positive environment</p>
        </div>
      </div>

      {/* Rules Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 py-4 space-y-6"
      >
        {rules.map((rule) => (
          <motion.div
            key={rule.id}
            variants={itemVariants}
            className={cn(
              "p-6 rounded-xl border",
              rule.type === 'important' && "bg-primary/5 border-primary/10",
              rule.type === 'do' && "bg-success/5 border-success/10",
              rule.type === 'dont' && "bg-error/5 border-error/10"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getRuleIcon(rule.type)}</div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-semibold text-base-content">{rule.title}</h3>
                <p className="text-base-content/80">{rule.description}</p>

                {/* Examples */}
                {rule.examples && (
                  <div className="space-y-3 mt-4">
                    {rule.examples.good && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-success">Good Examples:</h4>
                        <ul className="space-y-1">
                          {rule.examples.good.map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-base-content/80">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rule.examples.bad && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-error">What to Avoid:</h4>
                        <ul className="space-y-1">
                          {rule.examples.bad.map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-base-content/80">
                              <XCircle className="w-4 h-4 text-error" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RulesChannel; 