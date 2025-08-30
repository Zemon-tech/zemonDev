import { motion } from 'framer-motion';
import { useState, useMemo, useCallback, memo } from 'react';
import { 
  BookOpen, 
  Video, 
  Book, 
  GraduationCap, 
  Wrench, 
  Github, 
  FileText, 
  Eye, 
  ExternalLink,
  Bookmark,
  Star
} from 'lucide-react';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GradientText } from '@/components/blocks/GradientText';
import { useBookmarkedResources, BookmarkedResource } from '@/hooks/useBookmarkedResources';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';

interface BookmarkedResourcesCardProps {
  className?: string;
  maxItems?: number;
}

// Resource type icons mapping
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'article':
      return <FileText className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'book':
      return <Book className="w-4 h-4" />;
    case 'course':
      return <GraduationCap className="w-4 h-4" />;
    case 'tool':
      return <Wrench className="w-4 h-4" />;
    case 'repository':
      return <Github className="w-4 h-4" />;
    case 'documentation':
      return <BookOpen className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

// Resource type badge colors
const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'article':
      return 'badge-info';
    case 'video':
      return 'badge-warning';
    case 'book':
      return 'badge-success';
    case 'course':
      return 'badge-primary';
    case 'tool':
      return 'badge-secondary';
    case 'repository':
      return 'badge-accent';
    case 'documentation':
      return 'badge-neutral';
    default:
      return 'badge-info';
  }
};

// Difficulty badge colors
const getDifficultyBadgeColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'badge-success';
    case 'intermediate':
      return 'badge-warning';
    case 'advanced':
      return 'badge-error';
    default:
      return 'badge-info';
  }
};

function BookmarkedResourcesCardComponent({ className = '', maxItems = 4 }: BookmarkedResourcesCardProps) {
  const { resources, loading, error } = useBookmarkedResources();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const [navigatingResourceId, setNavigatingResourceId] = useState<string | null>(null);



  const handleResourceClick = useCallback(async (resource: BookmarkedResource, event?: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      setNavigatingResourceId(resource._id);
      
      // Check if it's an external resource (has URL starting with http)
      if (resource.url && resource.url.startsWith('http')) {
        const newWindow = window.open(resource.url, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
          toast({
            title: "Popup blocked",
            description: "Please allow popups for this site to open external resources.",
            variant: "error"
          });
        }
      } else {
        // Navigate to internal resource
        const forgePath = `/${username}/forge/${resource._id}`;
        navigate(forgePath, { replace: false });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation failed",
        description: "Unable to open the resource. Please try again.",
        variant: "error"
      });
    } finally {
      setNavigatingResourceId(null);
    }
  }, [username, navigate, toast]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent, resource: BookmarkedResource) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleResourceClick(resource);
    }
  }, [handleResourceClick]);

  const displayResources = useMemo(() => resources.slice(0, maxItems), [resources, maxItems]);

  return (
         <SpotlightCard className={`bg-gradient-to-br from-base-200/80 to-base-100/60 rounded-xl shadow-lg border border-base-300/50 p-3 h-69 ${className}`}>
       <motion.h2 
         className="text-sm font-bold text-warning font-heading mb-2 flex items-center justify-center gap-2"
         initial={{ opacity: 1, y: 0 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.1 }}
       >
         <Bookmark className="text-warning w-4 h-4" /> 
         <GradientText text="Bookmarked Resources" gradient="from-warning to-orange-500" className="text-sm" />
         <span className="text-xs text-base-content/60">({resources.length})</span>
       </motion.h2>
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-base-100/70 rounded-lg p-2 animate-pulse"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-base-300 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-base-300 rounded w-3/4" />
                  <div className="h-2 bg-base-300 rounded w-1/2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-error/90 rounded-lg border border-error/20 bg-error/5 p-3">
          Failed to load bookmarks
        </div>
      ) : displayResources.length === 0 ? (
        <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-3">
          No bookmarks yet
        </div>
      ) : (
        <div className="space-y-2">
          {displayResources.map((resource, idx) => (
                         <motion.div
               key={resource._id}
               whileHover={{ y: -1, scale: 1.01, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)' }}
               initial={{ opacity: 0.8, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: idx * 0.05 }}
               className="relative cursor-pointer group"
               role="button"
               tabIndex={0}
               aria-label={`Open ${resource.title} - ${resource.type} resource`}
               onKeyDown={(e) => handleKeyPress(e, resource)}
                               onClick={(e) => handleResourceClick(resource, e)}
             >
                             <div className="bg-gradient-to-br from-base-100/80 to-base-200/60 rounded-lg shadow-sm border border-base-300/50 p-2 hover:shadow-md transition-all duration-200">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                                           <div className="flex items-center gap-2 mb-1">
                        <div className="text-base-content/70 flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <h3 className="text-xs font-bold text-base-content text-center flex-1 leading-tight">
                          {resource.title}
                        </h3>
                      </div>
                     
                     <p className="text-xs text-base-content/70 mb-1 line-clamp-1">
                       {resource.description}
                     </p>
                     
                     <div className="flex items-center gap-1 flex-wrap">
                       <span className={`badge badge-xs ${getTypeBadgeColor(resource.type)} px-1.5 py-0.5 rounded-full font-medium`}>
                         {resource.type}
                       </span>
                       <span className={`badge badge-xs ${getDifficultyBadgeColor(resource.difficulty)} px-1.5 py-0.5 rounded-full font-medium`}>
                         {resource.difficulty}
                       </span>
                     </div>
                   </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-end gap-1"
                  >
                    <div className="flex items-center gap-1 text-xs text-base-content/60">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{resource.metrics.views}</span>
                    </div>
                    
                                                              <motion.button 
                       whileHover={{ x: 1 }}
                       disabled={navigatingResourceId === resource._id}
                       className={`btn btn-xs btn-warning rounded-full px-1.5 py-0.5 text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1 ${
                         navigatingResourceId === resource._id ? 'opacity-50 cursor-not-allowed' : ''
                       }`}
                                               onClick={(e) => {
                          e.stopPropagation();
                          handleResourceClick(resource, e);
                        }}
                                               aria-label={`${resource.url && resource.url.startsWith('http') ? 'Open' : 'View'} ${resource.title}`}
                     >
                       {navigatingResourceId === resource._id ? (
                         <>
                           <motion.div
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                             className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full"
                           />
                           Loading...
                         </>
                                               ) : resource.url && resource.url.startsWith('http') ? (
                         <>
                           Open
                           <ExternalLink className="w-2.5 h-2.5" />
                         </>
                       ) : (
                         <>
                           View
                           <BookOpen className="w-2.5 h-2.5" />
                         </>
                       )}
                     </motion.button>
                  </motion.div>
                </div>
                
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resource.tags.slice(0, 2).map((tag) => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        className="badge badge-outline badge-warning badge-xs px-1 py-0.5 rounded-full font-medium border-warning/30"
                      >
                        {tag}
                      </motion.span>
                    ))}
                    {resource.tags.length > 2 && (
                      <span className="badge badge-outline badge-warning badge-xs px-1 py-0.5 rounded-full font-medium border-warning/30">
                        +{resource.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {resources.length > maxItems && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-center pt-2"
            >
              <span className="text-xs text-base-content/60">
                +{resources.length - maxItems} more bookmarks
              </span>
            </motion.div>
          )}
        </div>
      )}
         </SpotlightCard>
   );
 }

export const BookmarkedResourcesCard = memo(BookmarkedResourcesCardComponent);
