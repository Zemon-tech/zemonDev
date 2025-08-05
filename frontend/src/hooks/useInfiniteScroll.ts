import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number; // Distance from top to trigger load more (in pixels)
  enabled?: boolean;
  debounceMs?: number; // Debounce time to prevent multiple rapid calls
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading,
  threshold = 50,
  enabled = true,
  debounceMs = 100
}: UseInfiniteScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollHeightRef = useRef<number>(0);
  const scrollTopRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);
  const shouldRestoreScrollRef = useRef<boolean>(false);
  const lastTriggerTimeRef = useRef<number>(0);

  // Update loading ref when loading state changes
  useEffect(() => {
    const wasLoading = isLoadingRef.current;
    isLoadingRef.current = loading;
    
    console.log('Loading state changed:', { wasLoading, isNowLoading: loading });
    
    // If we just finished loading, mark that we should restore scroll
    if (wasLoading && !loading) {
      shouldRestoreScrollRef.current = true;
      console.log('Marked for scroll restoration');
    }
  }, [loading]);

  const handleScroll = useCallback(() => {
    if (!enabled || !hasMore || isLoadingRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    
    // Store current scroll position and height
    scrollTopRef.current = scrollTop;
    scrollHeightRef.current = scrollHeight;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the scroll handler
    debounceTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current || isLoadingRef.current) return;
      
      const currentScrollTop = containerRef.current.scrollTop;
      
             // If we're near the top, load more
       // Trigger when we're at the top (0) or very close to it
       if (currentScrollTop <= threshold) {
         // Prevent rapid triggers when stuck at the top
         const now = Date.now();
         const timeSinceLastTrigger = now - lastTriggerTimeRef.current;
         
         if (timeSinceLastTrigger > 2000) { // Only trigger every 2 seconds when at top
           console.log('Triggering load more - scroll position:', currentScrollTop, 'threshold:', threshold);
           lastTriggerTimeRef.current = now;
           onLoadMore();
         } else {
           console.log('Skipping load more - too soon since last trigger at top:', timeSinceLastTrigger, 'ms');
         }
       }
    }, debounceMs);
  }, [onLoadMore, hasMore, enabled, threshold, debounceMs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Function to restore scroll position after content changes
  const restoreScrollPosition = useCallback(() => {
    console.log('restoreScrollPosition called:', { 
      hasContainer: !!containerRef.current, 
      shouldRestore: shouldRestoreScrollRef.current 
    });
    
    if (!containerRef.current || !shouldRestoreScrollRef.current) {
      console.log('Skipping scroll restoration');
      return;
    }
    
    const container = containerRef.current;
    const oldScrollTop = scrollTopRef.current;
    const oldScrollHeight = scrollHeightRef.current;
    const newScrollHeight = container.scrollHeight;
    
    // Calculate the height difference
    const heightDifference = newScrollHeight - oldScrollHeight;
    
    // Debug logging
    console.log('Restoring scroll position:', {
      oldScrollTop,
      oldScrollHeight,
      newScrollHeight,
      heightDifference,
      shouldRestore: shouldRestoreScrollRef.current
    });
    
    // Special handling for when user was at the top (scrollTop = 0)
    if (shouldRestoreScrollRef.current && oldScrollTop === 0) {
      console.log('User was at the top - keeping them at the top');
      // Use multiple requestAnimationFrame calls to ensure DOM has fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // Keep the user at the top
            containerRef.current.scrollTop = 0;
            console.log('Scroll position kept at top: 0');
          }
        });
      });
    } else if (shouldRestoreScrollRef.current && oldScrollTop > 0) {
      console.log('Attempting to restore scroll position');
      // Use multiple requestAnimationFrame calls to ensure DOM has fully updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // Calculate the new scroll position
            const newScrollTop = oldScrollTop + Math.max(heightDifference, 0);
            containerRef.current.scrollTop = newScrollTop;
            console.log('Scroll position restored to:', newScrollTop);
          }
        });
      });
    } else {
      console.log('Skipping scroll restoration - no valid condition met');
    }
    
    // Reset the flag
    shouldRestoreScrollRef.current = false;
  }, []);

  // Function to get current scroll position
  const getScrollPosition = useCallback(() => {
    if (!containerRef.current) return { scrollTop: 0, scrollHeight: 0 };
    
    return {
      scrollTop: containerRef.current.scrollTop,
      scrollHeight: containerRef.current.scrollHeight
    };
  }, []);

  // Function to set scroll position
  const setScrollPosition = useCallback((scrollTop: number) => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTop = scrollTop;
  }, []);

  return {
    containerRef,
    restoreScrollPosition,
    getScrollPosition,
    setScrollPosition,
    lastScrollTop: scrollTopRef.current,
    lastScrollHeight: scrollHeightRef.current
  };
}; 