import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
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
  clearReattemptingState: (problemId: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<ISolutionAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const inFlightRequest = useRef<boolean>(false);
  
  const { getToken } = useAuth();
  
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setLoading(false);
    setError(null);
    setCurrentProblemId(null);
    inFlightRequest.current = false;
  }, []);
  
  const checkAnalysis = useCallback(async (problemId: string) => {
    // Check if we're currently submitting a solution for this problem
    const isSubmitting = sessionStorage.getItem(`submitting_${problemId}`);
    if (isSubmitting) {
      logger.info(`Skipping analysis check for problem ${problemId} (submission in progress)`);
      return;
    }
    
    // Check if user is reattempting this problem
    const isReattempting = sessionStorage.getItem(`reattempting_${problemId}`);
    const reattemptTime = sessionStorage.getItem(`reattempt_time_${problemId}`);
    const isActivelyReattempting = reattemptTime && (Date.now() - parseInt(reattemptTime)) < 30 * 60 * 1000;
    
    if (isReattempting || isActivelyReattempting) {
      logger.info(`Skipping analysis check for problem ${problemId} (user is reattempting)`);
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
  }, [getToken, loading, currentProblemId, clearAnalysis]);

  const markReattempting = useCallback((problemId: string) => {
    logger.info('Marking problem as being reattempted:', problemId);
    clearAnalysis();
    sessionStorage.setItem(`reattempting_${problemId}`, 'true');
    sessionStorage.setItem(`reattempt_time_${problemId}`, Date.now().toString());
    
    // Clear any existing analysis for this problem to prevent redirect loops
    // This ensures that when user reattempts, they stay on the editor page
    if (analysis && analysis.problemId === problemId) {
      setAnalysis(null);
    }
    
    // Auto-clear reattempting state after 30 minutes to prevent stuck states
    setTimeout(() => {
      sessionStorage.removeItem(`reattempting_${problemId}`);
      sessionStorage.removeItem(`reattempt_time_${problemId}`);
    }, 30 * 60 * 1000); // 30 minutes
  }, [clearAnalysis, analysis]);
  
  const markSubmitting = useCallback((problemId: string) => {
    logger.info('Marking problem as being submitted:', problemId);
    clearAnalysis();
    sessionStorage.removeItem(`reattempting_${problemId}`);
    sessionStorage.removeItem(`reattempt_time_${problemId}`);
    sessionStorage.setItem(`submitting_${problemId}`, 'true');
    
    // Clear any existing analysis for this problem when submitting
    // This ensures a clean state for the new submission
    if (analysis && analysis.problemId === problemId) {
      setAnalysis(null);
    }
    
    setTimeout(() => {
      sessionStorage.removeItem(`submitting_${problemId}`);
    }, 10 * 60 * 1000);
  }, [clearAnalysis, analysis]);
  
  // Function to clear reattempting state when analysis is complete
  const clearReattemptingState = useCallback((problemId: string) => {
    logger.info('Clearing reattempting state for problem:', problemId);
    sessionStorage.removeItem(`reattempting_${problemId}`);
    sessionStorage.removeItem(`reattempt_time_${problemId}`);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        loading,
        error,
        checkAnalysis,
        clearAnalysis,
        markReattempting,
        markSubmitting,
        clearReattemptingState
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
