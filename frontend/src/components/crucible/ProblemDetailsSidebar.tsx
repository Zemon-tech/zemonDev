import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Sparkles,
  Users,
  Lightbulb,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Trophy,
  Rocket,
  FileText,
  GraduationCap,
  Settings,
  Wand2,
  Minimize2,
  Maximize2
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
  // Additional props for real problem data
  difficulty?: string;
  category?: string;
  expectedOutcome?: string;
  prerequisites?: Array<{ name: string; link: string }>;
  userPersonas?: Array<{ name: string; journey: string }> | { name: string; journey: string };
  dataAssumptions?: string[];
  edgeCases?: string[];
  communityTips?: Array<{ content: string; author: string }>;
  aiPrompts?: string[];
  technicalParameters?: string[];
  metrics?: {
    attempts: number;
    solutions: number;
    successRate: number;
  };
}

// Helper function to normalize requirements
function normalizeRequirements(requirements: ICrucibleProblem['requirements'] | string[]): { functional: string[]; nonFunctional: string[] } {
  if (Array.isArray(requirements)) {
    return { functional: requirements, nonFunctional: [] };
  }
  return requirements || { functional: [], nonFunctional: [] };
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Helper component for section headers with icons
function SectionHeader({ icon: Icon, children, color = "primary" }: { icon: React.ElementType; children: React.ReactNode; color?: string }) {
  const colorClasses = {
    primary: "text-primary",
    success: "text-success", 
    warning: "text-warning",
    error: "text-error",
    info: "text-info"
  };
  
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-base-content/90">
      <div className={`p-2 rounded-xl bg-gradient-to-br from-${color}/20 to-${color}/10 shadow-sm`}>
        <Icon className={`w-4 h-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`} />
      </div>
      <span>{children}</span>
    </div>
  );
}

// Badge component for difficulty
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, { bg: string; text: string; icon: React.ElementType; gradient: string }> = {
    easy: { 
      bg: 'bg-gradient-to-r from-green-400 to-emerald-500', 
      text: 'text-white', 
      icon: Star,
      gradient: 'from-green-400 to-emerald-500'
    },
    medium: { 
      bg: 'bg-gradient-to-r from-blue-400 to-cyan-500', 
      text: 'text-white', 
      icon: Target,
      gradient: 'from-blue-400 to-cyan-500'
    },
    hard: { 
      bg: 'bg-gradient-to-r from-orange-400 to-red-500', 
      text: 'text-white', 
      icon: Brain,
      gradient: 'from-orange-400 to-red-500'
    },
    expert: { 
      bg: 'bg-gradient-to-r from-purple-400 to-pink-500', 
      text: 'text-white', 
      icon: Zap,
      gradient: 'from-purple-400 to-pink-500'
    }
  };

  const style = colorMap[difficulty] || { 
    bg: 'bg-gradient-to-r from-primary to-secondary', 
    text: 'text-white', 
    icon: Star,
    gradient: 'from-primary to-secondary'
  };
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${style.bg} ${style.text} text-xs font-bold capitalize shadow-lg transform hover:scale-105 transition-all duration-200`}>
      <Icon className="w-3.5 h-3.5" />
      {difficulty}
    </span>
  );
}

// Category badge component
function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium capitalize shadow-md">
      {category}
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
  estimatedTime,
  learningObjectives,
  minWidth = 280,
  difficulty,
  category,
  expectedOutcome,
  prerequisites,
  userPersonas,
  dataAssumptions,
  edgeCases,
  communityTips,
  aiPrompts,
  technicalParameters,
  metrics
}: Props) {
  const { problemSidebarWidth, setProblemSidebarWidth } = useWorkspace();
  const [isResizing, setIsResizing] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const normalizedRequirements = normalizeRequirements(requirements);
  
  // Safety checks for arrays
  const safeHints = Array.isArray(hints) ? hints : [];
  const safeConstraints = Array.isArray(constraints) ? constraints : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeLearningObjectives = Array.isArray(learningObjectives) ? learningObjectives : [];
  const safePrerequisites = Array.isArray(prerequisites) ? prerequisites : [];
  const safeDataAssumptions = Array.isArray(dataAssumptions) ? dataAssumptions : [];
  const safeEdgeCases = Array.isArray(edgeCases) ? edgeCases : [];
  const safeCommunityTips = Array.isArray(communityTips) ? communityTips : [];
  const safeAiPrompts = Array.isArray(aiPrompts) ? aiPrompts : [];
  const safeTechnicalParameters = Array.isArray(technicalParameters) ? technicalParameters : [];

  // Show only first 4 tags in compact mode
  const displayTags = showFullDetails ? safeTags : safeTags.slice(0, 4);
  const hasMoreTags = safeTags.length > 4;

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
      className="h-full bg-gradient-to-br from-base-100 via-base-50 to-base-100 dark:from-base-800 dark:via-base-900 dark:to-base-800 border-r border-base-200 dark:border-base-700 flex flex-col overflow-hidden relative shadow-xl"
      style={{ 
        width: `${problemSidebarWidth}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Header Section */}
          <div className="space-y-5 pb-5 border-b border-base-200 dark:border-base-700">
            {/* Always visible: Title, badges, and collapse button */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-base-content leading-tight line-clamp-2 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text">
                    {title}
                  </h2>
                </div>
                
                {/* Problem Description Collapse/Expand Button */}
                <button
                  onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-base-content/70 hover:text-base-content hover:bg-base-200/50 dark:hover:bg-base-700/50 rounded-lg transition-all duration-200"
                  title={isDescriptionCollapsed ? "Expand Problem Description" : "Collapse Problem Description"}
                >
                  {isDescriptionCollapsed ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {difficulty && <DifficultyBadge difficulty={difficulty} />}
                {category && <CategoryBadge category={category} />}
                {estimatedTime && (
                  <div className="flex items-center text-xs text-base-content/70 gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-3 py-1.5 rounded-full shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium">{estimatedTime} min</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collapsible Content */}
            {isDescriptionCollapsed ? (
              /* Collapsed State - Compact Problem Description Container */
              <div className="bg-gradient-to-r from-base-200/50 to-base-300/50 dark:from-base-700/50 dark:to-base-800/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-base-content">Problem Description</h3>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">
                  {truncateText(description, 100)}
                </p>
                {expectedOutcome && (
                  <p className="text-xs text-primary/70 mt-2 line-clamp-1">
                    Expected: {truncateText(expectedOutcome, 60)}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {safeTags.slice(0, 3).map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-primary/10 text-primary/80 rounded-md text-[10px] font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                  {safeTags.length > 3 && (
                    <span className="px-2 py-1 bg-base-200 text-base-content/60 rounded-md text-[10px] font-medium">
                      +{safeTags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Expanded State - Full Details */
              <>
                <div className="prose-sm text-base-content/80 dark:text-base-content/70 text-sm leading-relaxed bg-base-200/30 dark:bg-base-700/30 p-4 rounded-xl">
                  {showFullDetails ? description : truncateText(description, 150)}
          </div>
          
                {expectedOutcome && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary p-4 rounded-r-xl shadow-sm">
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Expected Outcome
                    </h4>
                    <p className="text-sm text-base-content/80">
                      {showFullDetails ? expectedOutcome : truncateText(expectedOutcome, 120)}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {displayTags.map(tag => (
                <span 
                  key={tag} 
                      className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary/90 dark:text-primary/80 rounded-full text-xs font-medium capitalize hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 cursor-default shadow-sm"
                >
                  {tag}
                </span>
            ))}
                  {hasMoreTags && !showFullDetails && (
                    <span className="px-3 py-1.5 bg-base-200 text-base-content/60 rounded-full text-xs font-medium shadow-sm">
                      +{safeTags.length - 4} more
                    </span>
                  )}
            </div>

                {/* View Full Details Toggle */}
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-xl transition-all duration-200 text-sm font-medium text-primary shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  {showFullDetails ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Show Compact View
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View Full Details
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Metrics Section */}
          {metrics && (
            <div className="bg-gradient-to-br from-base-200/50 to-base-300/50 dark:from-base-700/50 dark:to-base-800/50 rounded-xl p-4 shadow-sm">
              <h4 className="text-sm font-bold text-base-content/90 mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                Problem Stats
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center bg-base-100 dark:bg-base-800 rounded-lg p-2 shadow-sm">
                  <div className="font-bold text-base-content text-lg">{metrics.attempts}</div>
                  <div className="text-base-content/60">Attempts</div>
                </div>
                <div className="text-center bg-base-100 dark:bg-base-800 rounded-lg p-2 shadow-sm">
                  <div className="font-bold text-base-content text-lg">{metrics.solutions}</div>
                  <div className="text-base-content/60">Solutions</div>
                </div>
                <div className="text-center bg-base-100 dark:bg-base-800 rounded-lg p-2 shadow-sm">
                  <div className="font-bold text-base-content text-lg">{metrics.successRate}%</div>
                  <div className="text-base-content/60">Success</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main content in tabs */}
          <Tabs defaultValue="requirements" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-base-200/50 dark:bg-base-700/50 rounded-xl p-1">
              <TabsTrigger 
                value="requirements" 
                className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Requirements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Technical</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assistance" 
                className="flex items-center gap-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Assistance</span>
              </TabsTrigger>
            </TabsList>

                        {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-4 mt-4">
              <Accordion type="multiple" className="space-y-3" defaultValue={["functional"]}>
                {/* Functional Requirements */}
                {normalizedRequirements.functional.length > 0 && (
                  <AccordionItem value="functional" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-success/10 hover:to-emerald-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={CheckCircle2} color="success">
                        Functional Requirements
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-3">
                        {normalizedRequirements.functional.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-success">{i + 1}</span>
                      </div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
                )}

                {/* Non-Functional Requirements */}
                {normalizedRequirements.nonFunctional.length > 0 && (
                  <AccordionItem value="nonfunctional" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-info/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={TrendingUp} color="info">
                        Non-Functional Requirements
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-3">
                        {normalizedRequirements.nonFunctional.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-info/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Target className="w-3.5 h-3.5 text-info" />
                      </div>
                            <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
                )}
            
            {/* Constraints */}
                {safeConstraints.length > 0 && (
            <AccordionItem value="constraints" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-warning/10 hover:to-orange-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={AlertCircle} color="warning">
                        Constraints
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-3">
                        {safeConstraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <Shield className="w-5 h-5 text-warning mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
                )}
              </Accordion>
            </TabsContent>

                        {/* Learning Tab */}
            <TabsContent value="learning" className="space-y-4 mt-4">
              <Accordion type="multiple" className="space-y-3" defaultValue={["learning-goals"]}>
                {/* Learning Objectives */}
                {safeLearningObjectives.length > 0 && (
                  <AccordionItem value="learning-goals" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-secondary/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Sparkles} color="secondary">
                        Learning Goals
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-3">
                        {safeLearningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            </div>
                            <span className="text-base-content/90 dark:text-base-content/80">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Prerequisites */}
                {safePrerequisites.length > 0 && (
                  <AccordionItem value="prerequisites" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={BookMarked} color="primary">
                        Prerequisites
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-2">
                        {safePrerequisites.map((prereq, i) => (
                        <li key={i}>
                          <a 
                            href={prereq.link} 
                              className="text-sm text-primary hover:underline flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-primary/5 transition-all duration-200 bg-base-200/30 dark:bg-base-700/30"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <BookOpen className="w-4 h-4" />
                            {prereq.name}
                              <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                  ))}
                </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Hints */}
                {safeHints.length > 0 && (
                  <AccordionItem value="hints" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-warning/10 hover:to-amber-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Lightbulb} color="warning">
                        Hints
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-3">
                        {safeHints.map((hint, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-warning/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb className="w-3.5 h-3.5 text-warning" />
                  </div>
                            <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
                )}
            
            {/* Community Tips */}
                {safeCommunityTips.length > 0 && (
                  <AccordionItem value="community-tips" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-success/10 hover:to-green-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={MessageSquare} color="success">
                        Community Tips
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                <div className="space-y-3">
                        {safeCommunityTips.map((tip, i) => (
                    <div 
                      key={i} 
                            className="bg-gradient-to-br from-base-200/50 to-base-300/50 dark:from-base-700/50 dark:to-base-800/50 rounded-xl p-4 shadow-sm"
                          >
                            <p className="text-base-content/80 dark:text-base-content/70 mb-3 italic text-sm">
                              "{tip.content}"
                            </p>
                            <div className="text-xs text-primary/70 font-medium">— {tip.author}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </TabsContent>

                        {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4 mt-4">
              <Accordion type="multiple" className="space-y-3" defaultValue={["technical-focus"]}>
                {/* Technical Parameters */}
                {safeTechnicalParameters.length > 0 && (
                  <AccordionItem value="technical-focus" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Zap} color="primary">
                        Technical Focus
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {safeTechnicalParameters.map((param, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-info/10 to-cyan-500/10 text-info text-xs rounded-full font-medium shadow-sm">
                            {param}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* User Personas */}
                {userPersonas && (
                  <AccordionItem value="user-personas" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-secondary/10 hover:to-pink-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Users} color="secondary">
                        User Personas
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <div className="space-y-3">
                        {(Array.isArray(userPersonas) ? userPersonas : [userPersonas]).map((persona, i) => (
                          <div key={i} className="bg-gradient-to-br from-base-200/50 to-base-300/50 dark:from-base-700/50 dark:to-base-800/50 rounded-xl p-4 shadow-sm">
                            <h5 className="text-sm font-bold text-base-content mb-2">{persona.name}</h5>
                            <p className="text-xs text-base-content/70">{persona.journey}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
                )}

                {/* Data Assumptions */}
                {safeDataAssumptions.length > 0 && (
                  <AccordionItem value="data-assumptions" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-info/10 hover:to-blue-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Target} color="info">
                        Data Assumptions
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-2">
                        {safeDataAssumptions.map((assumption, i) => (
                          <li key={i} className="text-sm text-base-content/80 flex items-start gap-3 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                            <span>{assumption}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Edge Cases */}
                {safeEdgeCases.length > 0 && (
                  <AccordionItem value="edge-cases" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-error/10 hover:to-red-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={AlertCircle} color="error">
                        Edge Cases
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <ul className="space-y-2">
                        {safeEdgeCases.map((edgeCase, i) => (
                          <li key={i} className="text-sm text-base-content/80 flex items-start gap-3 bg-base-200/30 dark:bg-base-700/30 p-3 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-warning/60 mt-2 flex-shrink-0"></div>
                            <span>{edgeCase}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </TabsContent>
            
                        {/* Assistance Tab */}
            <TabsContent value="assistance" className="space-y-4 mt-4">
              <Accordion type="multiple" className="space-y-3" defaultValue={["ai-assistant"]}>
            {/* AI Prompts */}
                {safeAiPrompts.length > 0 && (
                  <AccordionItem value="ai-assistant" className="border-none">
                    <AccordionTrigger className="py-3 px-4 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-secondary/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group">
                      <SectionHeader icon={Bot} color="secondary">
                        AI Assistant
                      </SectionHeader>
              </AccordionTrigger>
                    <AccordionContent className="px-4 py-3">
                      <div className="space-y-3">
                        {safeAiPrompts.map((prompt, i) => (
                    <button 
                      key={i}
                            className="w-full text-left py-3 px-4 text-sm bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 text-primary/90 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <Bot className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-2">{prompt}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
                )}
          </Accordion>
            </TabsContent>
          </Tabs>
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