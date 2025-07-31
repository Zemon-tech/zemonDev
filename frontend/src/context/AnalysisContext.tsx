import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLatestAnalysis, ISolutionAnalysisResult } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';
import { logger } from '@/lib/utils';

interface AnalysisContextType {
  analysis: ISolutionAnalysisResult | null;
  loading: boolean;
  error: string | null;
  checkAnalysis: (problemId: string) => Promise<void>;
  clearAnalysis: () => void;
  markReattempting: (problemId: string) => void;
  markSubmitting: (problemId: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<ISolutionAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inFlightRequest = useRef<boolean>(false);
  
  const { getToken } = useAuth();
  
  // Clean up any pending timeouts when unmounting
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  const clearAnalysis = () => {
    setAnalysis(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    setCurrentProblemId(null);
    inFlightRequest.current = false;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };
  
  const checkAnalysis = async (problemId: string) => {
    // Check if we're currently submitting a solution for this problem
    const isSubmitting = sessionStorage.getItem(`submitting_${problemId}`);
    if (isSubmitting) {
      logger.info(`Skipping analysis check for problem ${problemId} (submission in progress)`);
      return;
    }
    
    // Skip if we're already checking this problem or have a request in flight
    if (inFlightRequest.current || (loading && currentProblemId === problemId)) {
      logger.info('Skipping redundant analysis check (already in progress).');
      return;
    }
    
    // Clear previous state if checking a different problem
    if (currentProblemId !== problemId) {
      clearAnalysis();
    }
    
    setCurrentProblemId(problemId);
    setLoading(true);
    setError(null);
    inFlightRequest.current = true;
    
    try {
      logger.info(`Checking analysis for problem: ${problemId}`);
      const result = await getLatestAnalysis(problemId, getToken);
      if (result) {
        logger.info('Analysis found for problem:', problemId);
        setAnalysis(result);
        setRetryCount(0);
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      } else {
        // If no analysis is found, initiate retry logic
        handleRetry(problemId);
      }
    } catch (err) {
      logger.error("Error fetching analysis:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analysis");
    } finally {
      setLoading(false);
      inFlightRequest.current = false;
    }
  };

  const handleRetry = (problemId: string) => {
    // Check if we're currently submitting a solution for this problem
    const isSubmitting = sessionStorage.getItem(`submitting_${problemId}`);
    if (isSubmitting) {
      logger.info(`Skipping retry for problem ${problemId} (submission in progress)`);
      return;
    }
    
    if (retryCount < 3) {
      const delayMs = 15000 * (retryCount + 1);
      logger.info(`Analysis not found. Retrying in ${delayMs/1000}s (attempt ${retryCount + 1}/3)`);
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        checkAnalysis(problemId);
      }, delayMs);
    } else {
      logger.info('Max retries reached for problem:', problemId);
      setError("No analysis found for this problem after multiple attempts.");
    }
  };
  
  const markReattempting = (problemId: string) => {
    logger.info('Marking problem as being reattempted:', problemId);
    clearAnalysis();
    sessionStorage.setItem(`reattempting_${problemId}`, 'true');
    sessionStorage.setItem(`reattempt_time_${problemId}`, Date.now().toString());
  };
  
  const markSubmitting = (problemId: string) => {
    logger.info('Marking problem as being submitted:', problemId);
    clearAnalysis();
    sessionStorage.removeItem(`reattempting_${problemId}`);
    sessionStorage.removeItem(`reattempt_time_${problemId}`);
    sessionStorage.setItem(`submitting_${problemId}`, 'true');
    
    // Clear any existing retry timeouts to prevent them from firing during submission
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setTimeout(() => {
      sessionStorage.removeItem(`submitting_${problemId}`);
    }, 10 * 60 * 1000);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        loading,
        error,
        checkAnalysis,
        clearAnalysis,
        markReattempting,
        markSubmitting
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
