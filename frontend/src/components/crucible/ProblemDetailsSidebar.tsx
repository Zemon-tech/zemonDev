import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  User, 
  Database, 
  Shield, 
  BookMarked, 
  CheckSquare, 
  MessageSquare, 
  Bot, 
  ExternalLink 
} from 'lucide-react';

interface Props {
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  tags: string[];
  defaultWidth?: number;
  minWidth?: number;
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
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <Icon className="w-4 h-4 text-primary/80" />
      <span>{children}</span>
    </div>
  );
}

// Badge component for difficulty
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    easy: 'badge-success',
    medium: 'badge-info',
    hard: 'badge-warning',
    expert: 'badge-error'
  };

  return (
    <span className={`badge ${colorMap[difficulty] || 'badge-primary'} capitalize text-xs`}>
      {difficulty}
    </span>
  );
}

export default function ProblemDetailsSidebar({
  title,
  description,
  requirements,
  constraints,
  hints,
  tags,
  defaultWidth = 320,
  minWidth = 280,
}: Props) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
        setWidth(newWidth);
      }
    }
  }, [isResizing, minWidth]);

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
    // In a real app, this would dispatch an event or call a function to populate the AI chat
    console.log('AI prompt clicked:', prompt);
    // Example of dispatching a custom event that could be caught by the AI chat component
    window.dispatchEvent(new CustomEvent('ai-prompt-selected', { detail: { prompt } }));
  };

  return (
    <aside 
      className="h-full bg-base-100 dark:bg-base-800 border-r border-base-200 dark:border-base-700 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="p-2 space-y-2 shadow-none border-none bg-transparent">
          {/* Title and description */}
          <h2 className="text-base font-bold text-base-content">{title}</h2>
          
          {/* Difficulty & Estimated Time */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <DifficultyBadge difficulty={mockData.difficulty} />
            <div className="flex items-center text-xs text-base-content/70 gap-1">
              <Clock className="w-3 h-3" />
              <span>Est. {mockData.estimatedTime} min</span>
            </div>
          </div>
          
          <div className="prose-sm text-base-content/80 dark:text-base-content/70 text-xs mb-2">{description}</div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(tag => (
              <span key={tag} className="badge badge-sm capitalize badge-outline text-[10px] py-0 h-5 text-base-content/80 dark:text-base-content/70">{tag}</span>
            ))}
          </div>
          
          {/* Main content in accordion */}
          <Accordion type="single" collapsible className="space-y-1" defaultValue="requirements">
            {/* Requirements */}
            <AccordionItem value="requirements" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={CheckCircle2}>Requirements</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Constraints */}
            <AccordionItem value="constraints" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={Shield}>Constraints</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Learning Objectives */}
            <AccordionItem value="learning" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={BookOpen}>You'll Learn...</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-none text-xs space-y-1 text-base-content/90 dark:text-base-content/80">
                  {mockData.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">✔️</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Prerequisites & Glossary */}
            <AccordionItem value="prerequisites" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={BookMarked}>Prerequisites</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-none text-xs space-y-1.5 text-base-content/90 dark:text-base-content/80">
                  {mockData.prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <a 
                        href={prereq.link} 
                        className="text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, navigate to the forge article
                          console.log('Navigate to:', prereq.link);
                        }}
                      >
                        {prereq.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* User Persona & Journey */}
            <AccordionItem value="persona" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={User}>User Persona</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <div className="text-xs space-y-1 text-base-content/90 dark:text-base-content/80">
                  <div className="font-medium">👤 {mockData.userPersona.name}</div>
                  <div className="text-xs">{mockData.userPersona.journey}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Data & Scale Assumptions */}
            <AccordionItem value="data" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={Database}>Data & Scale</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {mockData.dataAssumptions.map((assumption, i) => (
                    <li key={i}>{assumption}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Edge-Cases & Gotchas */}
            <AccordionItem value="edge-cases" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={Shield}>Watch Outs</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {mockData.edgeCases.map((edge, i) => (
                    <li key={i}>{edge}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Related Resources */}
            <AccordionItem value="resources" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={BookMarked}>From the Forge</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-none text-xs space-y-1.5 text-base-content/90 dark:text-base-content/80">
                  {mockData.relatedResources.map((resource, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <a 
                        href={resource.link} 
                        className="text-primary hover:underline flex items-center gap-1"
                        onClick={(e) => {
                          e.preventDefault();
                          // In a real app, navigate to the forge article
                          console.log('Navigate to:', resource.link);
                        }}
                      >
                        {resource.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* Subtask Checklist */}
            <AccordionItem value="subtasks" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={CheckSquare}>Milestones</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <div className="text-xs space-y-1 text-base-content/90 dark:text-base-content/80">
                  {mockData.subtasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" />
                      <span>{i + 1}. {task}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Community Tips */}
            <AccordionItem value="community" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={MessageSquare}>From Peers</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <div className="text-xs space-y-2 text-base-content/90 dark:text-base-content/80">
                  {mockData.communityTips.map((tip, i) => (
                    <div key={i} className="italic border-l-2 border-primary/30 pl-2 py-0.5">{tip}</div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* AI Hints */}
            <AccordionItem value="hints" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={Bot}>AI Hints</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            {/* AI Prompt Starters */}
            <AccordionItem value="prompts" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-xs font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                <SectionHeader icon={Bot}>Ask the AI</SectionHeader>
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <div className="text-xs space-y-1 text-base-content/90 dark:text-base-content/80">
                  {mockData.aiPrompts.map((prompt, i) => (
                    <button 
                      key={i}
                      className="w-full text-left py-1 px-2 hover:bg-primary/10 rounded-sm transition-colors flex items-center gap-1"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <Bot className="w-3 h-3 text-primary" />
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