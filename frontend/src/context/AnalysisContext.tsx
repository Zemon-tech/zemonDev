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
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const inFlightRequest = useRef<boolean>(false);
  
  const { getToken } = useAuth();
  
  // No cleanup needed since we removed retry logic
  
  const clearAnalysis = () => {
    setAnalysis(null);
    setLoading(false);
    setError(null);
    setCurrentProblemId(null);
    inFlightRequest.current = false;
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
      } else {
        // No analysis exists yet - this is normal for new problems
        logger.info('No analysis found for problem (this is normal for new problems):', problemId);
        setAnalysis(null);
        // Don't initiate retry logic - analysis will be created when user submits solution
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
    // This function is no longer needed since we don't retry for missing analysis
    // Analysis should only be checked after user submits a solution
    logger.info('Retry logic disabled - analysis should be created when user submits solution');
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
