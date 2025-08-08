import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import React, { useState, useCallback, useEffect } from 'react';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Shield, 
  BookMarked,
  MessageSquare, 
  Bot,
  Star,
  Target,
  Brain,
  Zap,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { ICrucibleProblem } from '@/lib/crucibleApi';

interface Props {
  title: string;
  description: string;
  requirements: ICrucibleProblem['requirements'] | string[];
  constraints: string[];
  hints: string[];
  tags: string[];
  estimatedTime?: number;
  learningObjectives?: string[];
  minWidth?: number;
}

// Helper function to normalize requirements
function normalizeRequirements(requirements: ICrucibleProblem['requirements'] | string[]): string[] {
  if (Array.isArray(requirements)) {
    return requirements;
  }
  return Object.entries(requirements).map(([key, value]) => `${key}: ${value}`);
}

// Mock data for new sections (in a real app, this would come from props or API)
const mockData = {
  difficulty: 'medium',
  estimatedTime: 45,
  learningObjectives: [
    'Scalable queue architecture',
    'Trade-off analysis between consistency and availability',
    'Distributed caching strategies'
  ],
  prerequisites: [
    { name: 'Kafka basics', link: '/forge/kafka-basics' },
    { name: 'CAP theorem', link: '/forge/cap-theorem' },
    { name: 'Consistent hashing', link: '/forge/consistent-hashing' }
  ],
  userPersona: {
    name: 'Marketing Manager',
    journey: 'Schedules campaign → selects segment → hits send'
  },
  dataAssumptions: [
    'Total users: 50M',
    'Peak load: 10k req/sec',
    'Payload size: ~200B',
    'Storage requirements: 5TB/year'
  ],
  edgeCases: [
    'URL collision handling',
    'Expired URL access',
    'Malicious URL detection',
    'Rate limiting for abusive clients',
    'Database failover scenarios'
  ],
  relatedResources: [
    { title: 'System Design Primer', link: '/forge/system-design-primer' },
    { title: 'Scaling to Millions of Users', link: '/forge/scaling-millions' },
    { title: 'Database Sharding Patterns', link: '/forge/sharding-patterns' }
  ],
  subtasks: [
    'Draw architecture diagram',
    'Define data model and schema',
    'Plan failure handling and recovery',
    'Sketch monitoring and alerting',
    'Outline scaling strategy'
  ],
  communityTips: [
    '"Focus on the read:write ratio first, it drives most architectural decisions." - Senior Engineer',
    '"Don\'t forget about analytics - they often become a bottleneck in high-traffic systems." - Staff Engineer'
  ],
  aiPrompts: [
    'Help me analyze the trade-offs between SQL and NoSQL for this URL shortener',
    'What caching strategy would work best for this use case?',
    'How would you handle URL collisions in a distributed system?',
    'What monitoring metrics would be critical for this service?',
    'Explain how to implement a custom base62 encoding for shorter URLs'
  ]
};

// Helper component for section headers with icons
function SectionHeader({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-base-content/90">
      <Icon className="w-4 h-4 text-primary" />
      <span>{children}</span>
    </div>
  );
}

// Badge component for difficulty
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    easy: { bg: 'bg-success/10', text: 'text-success', icon: Star },
    medium: { bg: 'bg-info/10', text: 'text-info', icon: Target },
    hard: { bg: 'bg-warning/10', text: 'text-warning', icon: Brain },
    expert: { bg: 'bg-error/10', text: 'text-error', icon: Zap }
  };

  const style = colorMap[difficulty] || { bg: 'bg-primary/10', text: 'text-primary', icon: Star };
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${style.bg} ${style.text} text-xs font-medium capitalize`}>
      <Icon className="w-3 h-3" />
      {difficulty}
    </span>
  );
}

export default function ProblemDetailsSidebar({
  title,
  description,
  requirements,
  constraints,
  tags,
  estimatedTime,
  learningObjectives,
  minWidth = 280,
}: Props) {
  const { problemSidebarWidth, setProblemSidebarWidth } = useWorkspace();
  const [isResizing, setIsResizing] = useState(false);
  const normalizedRequirements = normalizeRequirements(requirements);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      const maxWidth = window.innerWidth / 2;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setProblemSidebarWidth(newWidth);
      }
    }
  }, [isResizing, minWidth, setProblemSidebarWidth]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Function to handle AI prompt clicks
  const handlePromptClick = (prompt: string) => {
    window.dispatchEvent(new CustomEvent('ai-prompt-selected', { detail: { prompt } }));
  };

  return (
    <aside 
      className="h-full bg-base-100 dark:bg-base-800 border-r border-base-200 dark:border-base-700 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${problemSidebarWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Header Section */}
          <div className="space-y-3 pb-4 border-b border-base-200 dark:border-base-700">
            <h2 className="text-lg font-bold text-base-content leading-tight">{title}</h2>
          
            <div className="flex items-center justify-between gap-2">
            <DifficultyBadge difficulty={mockData.difficulty} />
              <div className="flex items-center text-xs text-base-content/70 gap-1.5 bg-base-200/50 dark:bg-base-700/50 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
              <span>Est. {estimatedTime || mockData.estimatedTime} min</span>
            </div>
          </div>
          
            <div className="prose-sm text-base-content/80 dark:text-base-content/70 text-sm">{description}</div>
          
            <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 bg-primary/5 text-primary/90 dark:text-primary/80 rounded-md text-xs font-medium capitalize hover:bg-primary/10 transition-colors cursor-default"
                >
                  {tag}
                </span>
            ))}
            </div>
          </div>
          
          {/* Main content in accordion */}
          <Accordion type="single" collapsible className="space-y-2" defaultValue="requirements">
            {/* Requirements */}
            <AccordionItem value="requirements" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={CheckCircle2}>Requirements</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <ul className="space-y-2">
                  {normalizedRequirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80">
                      <div className="w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-primary/70">{i + 1}</span>
                      </div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Learning Objectives */}
            <AccordionItem value="learning" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={Sparkles}>Learning Goals</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <ul className="space-y-2">
                  {learningObjectives?.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      </div>
                      <span className="text-base-content/90 dark:text-base-content/80">{obj}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Constraints */}
            <AccordionItem value="constraints" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={AlertCircle}>Constraints</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <ul className="space-y-2">
                  {constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80">
                      <Shield className="w-4 h-4 text-warning mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Prerequisites & Resources */}
            <AccordionItem value="resources" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={BookMarked}>Resources</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-base-content/70">Prerequisites</h4>
                    <ul className="space-y-1">
                      {mockData.prerequisites.map((prereq, i) => (
                        <li key={i}>
                          <a 
                            href={prereq.link} 
                            className="text-sm text-primary hover:underline flex items-center gap-1.5 py-1 px-2 rounded hover:bg-primary/5 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Navigate to:', prereq.link);
                            }}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {prereq.name}
                          </a>
                        </li>
                  ))}
                </ul>
                  </div>
                  
                  {/* <div className="space-y-1.5">
                    <h4 className="text-xs font-medium text-base-content/70">Related Articles</h4>
                    <ul className="space-y-1">
                  {mockData.relatedResources.map((resource, i) => (
                        <li key={i}>
                      <a 
                        href={resource.link} 
                            className="text-sm text-primary hover:underline flex items-center gap-1.5 py-1 px-2 rounded hover:bg-primary/5 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Navigate to:', resource.link);
                        }}
                      >
                            <ExternalLink className="w-3.5 h-3.5" />
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
                    </div> */}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Community Tips */}
            <AccordionItem value="community" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={MessageSquare}>Community Tips</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <div className="space-y-3">
                  {mockData.communityTips.map((tip, i) => (
                    <div 
                      key={i} 
                      className="bg-base-200/30 dark:bg-base-700/30 rounded-lg p-3 text-sm italic text-base-content/80 dark:text-base-content/70"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* AI Prompts */}
            <AccordionItem value="prompts" className="border-none">
              <AccordionTrigger className="py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-base-200/50 dark:hover:bg-base-700/30 rounded-lg transition-colors">
                <SectionHeader icon={Bot}>Ask AI Assistant</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2">
                <div className="space-y-2">
                  {mockData.aiPrompts.map((prompt, i) => (
                    <button 
                      key={i}
                      className="w-full text-left py-2 px-3 text-sm bg-primary/5 hover:bg-primary/10 text-primary/90 rounded-lg transition-colors flex items-center gap-2"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <Bot className="w-4 h-4 flex-shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
      
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors"
        onMouseDown={startResizing}
        style={{
          cursor: isResizing ? 'col-resize' : undefined,
          userSelect: 'none',
          touchAction: 'none',
        }}
      />
    </aside>
  );
} 