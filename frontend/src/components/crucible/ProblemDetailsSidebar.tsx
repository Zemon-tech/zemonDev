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
  AlertCircle,
  Users,
  Lightbulb,
  ExternalLink,
  TrendingUp,
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
}

interface IRequirement {
  requirement: string;
  context: string;
}

// Helper function to normalize requirements
function normalizeRequirements(requirements: ICrucibleProblem['requirements'] | string[]): { functional: IRequirement[]; nonFunctional: IRequirement[] } {
  if (Array.isArray(requirements)) {
    // Backward compatibility: convert string array to IRequirement array
    return { 
      functional: requirements.map(req => ({ requirement: req, context: '' })), 
      nonFunctional: [] 
    };
  }
  
  // Handle new structure with backward compatibility for individual requirements
  const normalizeRequirementArray = (reqArray: any[]): IRequirement[] => {
    return reqArray.map(req => {
      if (typeof req === 'string') {
        // Backward compatibility: convert string to IRequirement
        return { requirement: req, context: '' };
      } else if (req && typeof req === 'object' && 'requirement' in req) {
        // New structure: ensure context exists
        return { 
          requirement: req.requirement || '', 
          context: req.context || '' 
        };
      } else {
        // Fallback: treat as string
        return { requirement: String(req), context: '' };
      }
    });
  };

  return {
    functional: normalizeRequirementArray(requirements.functional || []),
    nonFunctional: normalizeRequirementArray(requirements.nonFunctional || [])
  };
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper function to get localStorage key for this problem
function getStorageKey(problemId: string, key: string): string {
  return `crucible_sidebar_${problemId}_${key}`;
}

// Helper function to save state to localStorage
function saveToStorage(problemId: string, key: string, value: any): void {
  try {
    localStorage.setItem(getStorageKey(problemId, key), JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// Helper function to load state from localStorage
function loadFromStorage(problemId: string, key: string, defaultValue: any): any {
  try {
    const stored = localStorage.getItem(getStorageKey(problemId, key));
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

// Section Header Component
function SectionHeader({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg bg-${color}/10`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
      <span className="font-semibold">{children}</span>
    </div>
  );
}

// Difficulty Badge Component
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
    expert: 'secondary'
  };
  
  return (
    <span className={`badge badge-${colors[difficulty as keyof typeof colors] || 'neutral'} badge-sm gap-1`}>
      <Star className="w-3 h-3" />
      {difficulty}
    </span>
  );
}

// Category Badge Component
function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="badge badge-outline badge-sm gap-1">
      <BookMarked className="w-3 h-3" />
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
  technicalParameters
}: Props) {
  const { problemSidebarWidth, setProblemSidebarWidth } = useWorkspace();
  const [isResizing, setIsResizing] = useState(false);
  
  // Generate a simple problem ID from title for localStorage
  const problemId = title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
  
  // Load collapsed state from localStorage, default to true (collapsed)
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(() => 
    loadFromStorage(problemId, 'descriptionCollapsed', true)
  );
  
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



  // Determine if sidebar is narrow (for responsive design)
  const isNarrow = problemSidebarWidth < 320;

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    saveToStorage(problemId, 'descriptionCollapsed', isDescriptionCollapsed);
  }, [isDescriptionCollapsed, problemId]);

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
        <div className={`${isNarrow ? 'p-3' : 'p-4'} space-y-4`}>
          {/* Header Section */}
          <div className="space-y-4 pb-4 border-b border-base-200 dark:border-base-700">
            {/* Always visible: Title, badges, and collapse button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`${isNarrow ? 'p-1.5' : 'p-2'} rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0`}>
                    <Rocket className={`${isNarrow ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
                  </div>
                  <h2 className={`${isNarrow ? 'text-lg' : 'text-xl'} font-bold text-base-content leading-tight line-clamp-2 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text min-w-0`}>
                    {title}
                  </h2>
                </div>
                
                {/* Problem Description Collapse/Expand Button */}
                <button
                  onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                  className={`flex items-center gap-1 ${isNarrow ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs'} font-medium text-base-content/70 hover:text-base-content hover:bg-base-200/50 dark:hover:bg-base-700/50 rounded-lg transition-all duration-200 flex-shrink-0`}
                  title={isDescriptionCollapsed ? "Expand Problem Description" : "Collapse Problem Description"}
                >
                  {isDescriptionCollapsed ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minimize2 className="w-3.5 h-3.5" />
                  )}
                  {!isNarrow && (
                    <span className="hidden sm:inline">
                      {isDescriptionCollapsed ? "Expand" : "Collapse"}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {difficulty && <DifficultyBadge difficulty={difficulty} />}
                {category && <CategoryBadge category={category} />}
                {estimatedTime && (
                  <div className={`flex items-center text-xs text-base-content/70 gap-1 ${isNarrow ? 'px-2 py-1' : 'px-3 py-1.5'} bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full shadow-sm`}>
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium">{estimatedTime}m</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collapsible Content */}
            {isDescriptionCollapsed ? (
              /* Collapsed State - Compact Problem Description Container */
              <div className="bg-gradient-to-r from-base-200/50 to-base-300/50 dark:from-base-700/50 dark:to-base-800/50 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-base-content">Problem Description</h3>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">
                  {truncateText(description, isNarrow ? 80 : 100)}
                </p>
                {expectedOutcome && (
                  <p className="text-xs text-primary/70 mt-2 line-clamp-1">
                    Expected: {truncateText(expectedOutcome, isNarrow ? 50 : 60)}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {safeTags.slice(0, isNarrow ? 2 : 3).map(tag => (
                    <span 
                      key={tag} 
                      className={`px-2 py-1 bg-primary/10 text-primary/80 rounded-md text-[10px] font-medium capitalize ${isNarrow ? 'text-[9px] px-1.5 py-0.5' : ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {safeTags.length > (isNarrow ? 2 : 3) && (
                    <span className={`px-2 py-1 bg-base-200 text-base-content/60 rounded-md text-[10px] font-medium ${isNarrow ? 'text-[9px] px-1.5 py-0.5' : ''}`}>
                      +{safeTags.length - (isNarrow ? 2 : 3)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Expanded State - Full Details */
              <>
                <div className="prose-sm text-base-content/80 dark:text-base-content/70 text-sm leading-relaxed bg-base-200/30 dark:bg-base-700/30 p-3 rounded-xl">
                  {description}
                </div>
          
                {expectedOutcome && (
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary p-3 rounded-r-xl shadow-sm">
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Expected Outcome
                    </h4>
                    <p className="text-sm text-base-content/80">
                      {expectedOutcome}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1.5">
                  {safeTags.map(tag => (
                    <span 
                      key={tag} 
                      className={`px-2 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary/90 dark:text-primary/80 rounded-full text-xs font-medium capitalize hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 cursor-default shadow-sm ${isNarrow ? 'text-[10px] px-1.5 py-0.5' : ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>


              </>
            )}
          </div>


          
          {/* Main content in tabs */}
          <Tabs defaultValue="requirements" className="space-y-3">
            <TabsList className={`grid w-full grid-cols-4 bg-base-200/50 dark:bg-base-700/50 rounded-xl p-1 ${isNarrow ? 'gap-1' : ''}`}>
              <TabsTrigger 
                value="requirements" 
                className={`flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all ${isNarrow ? 'p-1.5' : 'p-2'}`}
                title="Requirements"
              >
                <FileText className="w-3.5 h-3.5" />
                {!isNarrow && <span className="hidden sm:inline">Requirements</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className={`flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all ${isNarrow ? 'p-1.5' : 'p-2'}`}
                title="Learning"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {!isNarrow && <span className="hidden sm:inline">Learning</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className={`flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all ${isNarrow ? 'p-1.5' : 'p-2'}`}
                title="Technical"
              >
                <Settings className="w-3.5 h-3.5" />
                {!isNarrow && <span className="hidden sm:inline">Technical</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="assistance" 
                className={`flex items-center gap-1.5 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-base-800 data-[state=active]:shadow-sm rounded-lg transition-all ${isNarrow ? 'p-1.5' : 'p-2'}`}
                title="Assistance"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {!isNarrow && <span className="hidden sm:inline">Assistance</span>}
              </TabsTrigger>
            </TabsList>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-3 mt-3">
              <Accordion type="multiple" className="space-y-2" defaultValue={["functional"]}>
                {/* Functional Requirements */}
                {normalizedRequirements.functional.length > 0 && (
                  <AccordionItem value="functional" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-success/10 hover:to-emerald-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={CheckCircle2} color="success">
                        {isNarrow ? "Functional" : "Functional Requirements"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {normalizedRequirements.functional.map((req, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-success">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{req.requirement}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Non-Functional Requirements */}
                {normalizedRequirements.nonFunctional.length > 0 && (
                  <AccordionItem value="nonfunctional" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-info/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={TrendingUp} color="info">
                        {isNarrow ? "Non-Functional" : "Non-Functional Requirements"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {normalizedRequirements.nonFunctional.map((req, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-info/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Target className="w-3.5 h-3.5 text-info" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{req.requirement}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
            
                {/* Constraints */}
                {safeConstraints.length > 0 && (
                  <AccordionItem value="constraints" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-warning/10 hover:to-orange-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={AlertCircle} color="warning">
                        Constraints
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeConstraints.map((c, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <Shield className="w-4 h-4 text-warning mt-0.5" />
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
            <TabsContent value="learning" className="space-y-3 mt-3">
              <Accordion type="multiple" className="space-y-2">
                {/* Learning Objectives */}
                {safeLearningObjectives.length > 0 && (
                  <AccordionItem value="objectives" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Target} color="primary">
                        {isNarrow ? "Objectives" : "Learning Objectives"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeLearningObjectives.map((obj, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{i + 1}</span>
                            </div>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Prerequisites */}
                {safePrerequisites.length > 0 && (
                  <AccordionItem value="prerequisites" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-info/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={BookOpen} color="info">
                        Prerequisites
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safePrerequisites.map((prereq, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-info/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-info">{i + 1}</span>
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{prereq.name}</span>
                              {prereq.link && (
                                <a 
                                  href={prereq.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-primary hover:underline text-xs"
                                >
                                  <ExternalLink className="w-3 h-3 inline" />
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* User Personas */}
                {userPersonas && (
                  <AccordionItem value="personas" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-secondary/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Users} color="secondary">
                        {isNarrow ? "Personas" : "User Personas"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <div className="space-y-2">
                        {Array.isArray(userPersonas) ? userPersonas.map((persona, i) => (
                          <div key={i} className={`bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : 'text-sm'}`}>
                            <div className="font-medium text-base-content/90">{persona.name}</div>
                            <div className="text-base-content/70 mt-1">{persona.journey}</div>
                          </div>
                        )) : (
                          <div className={`bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : 'text-sm'}`}>
                            <div className="font-medium text-base-content/90">{userPersonas.name}</div>
                            <div className="text-base-content/70 mt-1">{userPersonas.journey}</div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-3 mt-3">
              <Accordion type="multiple" className="space-y-2">
                {/* Data Assumptions */}
                {safeDataAssumptions.length > 0 && (
                  <AccordionItem value="assumptions" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-warning/10 hover:to-orange-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Brain} color="warning">
                        {isNarrow ? "Assumptions" : "Data Assumptions"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeDataAssumptions.map((assumption, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-warning/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-warning">{i + 1}</span>
                            </div>
                            <span>{assumption}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Edge Cases */}
                {safeEdgeCases.length > 0 && (
                  <AccordionItem value="edgecases" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-error/10 hover:to-red-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={AlertCircle} color="error">
                        {isNarrow ? "Edge Cases" : "Edge Cases"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeEdgeCases.map((edgeCase, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-error/20 to-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-error">{i + 1}</span>
                            </div>
                            <span>{edgeCase}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Technical Parameters */}
                {safeTechnicalParameters.length > 0 && (
                  <AccordionItem value="parameters" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-info/10 hover:to-cyan-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Settings} color="info">
                        {isNarrow ? "Parameters" : "Technical Parameters"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeTechnicalParameters.map((param, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-info/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-info">{i + 1}</span>
                            </div>
                            <span>{param}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </TabsContent>

            {/* Assistance Tab */}
            <TabsContent value="assistance" className="space-y-3 mt-3">
              <Accordion type="multiple" className="space-y-2">
                {/* AI Prompts */}
                {safeAiPrompts.length > 0 && (
                  <AccordionItem value="prompts" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Bot} color="primary">
                        {isNarrow ? "AI Prompts" : "AI Assistance Prompts"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <div className="space-y-2">
                        {safeAiPrompts.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handlePromptClick(prompt)}
                            className={`w-full text-left p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-all duration-200 text-sm text-base-content/90 dark:text-base-content/80 ${isNarrow ? 'text-xs' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">{i + 1}</span>
                              </div>
                              <span>{prompt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Hints */}
                {safeHints.length > 0 && (
                  <AccordionItem value="hints" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-success/10 hover:to-emerald-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={Lightbulb} color="success">
                        Hints
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <ul className="space-y-2">
                        {safeHints.map((hint, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm text-base-content/90 dark:text-base-content/80 bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : ''}`}>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lightbulb className="w-3.5 h-3.5 text-success" />
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
                  <AccordionItem value="tips" className="border-none">
                    <AccordionTrigger className={`py-2 px-3 text-sm w-full flex justify-between items-center hover:bg-gradient-to-r hover:from-secondary/10 hover:to-purple-500/10 rounded-xl transition-all duration-200 group ${isNarrow ? 'text-xs' : ''}`}>
                      <SectionHeader icon={MessageSquare} color="secondary">
                        {isNarrow ? "Community Tips" : "Community Tips"}
                      </SectionHeader>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <div className="space-y-2">
                        {safeCommunityTips.map((tip, i) => (
                          <div key={i} className={`bg-base-200/30 dark:bg-base-700/30 p-2 rounded-lg ${isNarrow ? 'text-xs' : 'text-sm'}`}>
                            <div className="text-base-content/90">{tip.content}</div>
                            <div className="text-base-content/60 text-xs mt-1">— {tip.author}</div>
                          </div>
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

      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
        onMouseDown={startResizing}
      />
    </aside>
  );
} 