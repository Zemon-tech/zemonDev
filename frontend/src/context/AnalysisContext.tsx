import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLatestAnalysis, ISolutionAnalysisResult } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';

interface AnalysisContextType {
  analysis: ISolutionAnalysisResult | null;
  loading: boolean;
  error: string | null;
  checkAnalysis: (problemId: string) => Promise<void>;
  clearAnalysis: () => void;
  retryCount: number;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<ISolutionAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<number>(0);
  
  // Use a ref to track in-flight requests
  const inFlightRequest = useRef<boolean>(false);
  
  const { getToken } = useAuth();
  
  // Clean up any pending timeouts when unmounting
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);
  
  const clearAnalysis = () => {
    setAnalysis(null);
    setLoading(false);
    setError(null);
    setRetryCount(0);
    setCurrentProblemId(null);
    setLastCheckedAt(0);
    inFlightRequest.current = false;
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  };
  
  const checkAnalysis = async (problemId: string) => {
    // Implement debouncing - prevent rapid repeated calls
    const now = Date.now();
    const debounceTime = 1000; // 1 second debounce
    
    // Skip if we're already checking this problem or have checked it very recently
    if ((loading && currentProblemId === problemId) || 
        (inFlightRequest.current && currentProblemId === problemId) ||
        (currentProblemId === problemId && now - lastCheckedAt < debounceTime)) {
      console.log('Skipping redundant analysis check for problem:', problemId);
      return;
    }
    
    // Clear previous state if checking a different problem
    if (currentProblemId !== problemId) {
      clearAnalysis();
      setCurrentProblemId(problemId);
    }
    
    // Update last checked timestamp
    setLastCheckedAt(now);
    setLoading(true);
    setError(null);
    
    // Mark that we have a request in flight
    inFlightRequest.current = true;
    
    try {
      console.log('Checking analysis for problem:', problemId);
      const token = await getToken();
      if (!token) {
        setError("Authentication failed");
        setLoading(false);
        inFlightRequest.current = false;
        return;
      }
      
      const result = await getLatestAnalysis(problemId, () => Promise.resolve(token));
      if (result) {
        console.log('Analysis found for problem:', problemId);
        setAnalysis(result);
        setLoading(false);
        setRetryCount(0);
        inFlightRequest.current = false;
        return;
      }
      
      // If no analysis found and not already retrying, start smart retry
      if (retryCount < 3) {
        // Exponential backoff: 15s, 30s, 45s
        const delayMs = 15000 * (retryCount + 1);
        
        console.log(`Analysis not found. Retrying in ${delayMs/1000}s (attempt ${retryCount + 1}/3)`);
        
        const timeout = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          inFlightRequest.current = false; // Reset before retry
          checkAnalysis(problemId);
        }, delayMs);
        
        setRetryTimeout(timeout);
      } else {
        // After 3 retries, show error
        console.log('Max retries reached for problem:', problemId);
        setError("No analysis found for this problem. You may need to submit a solution first.");
        setLoading(false);
        inFlightRequest.current = false;
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch analysis");
      setLoading(false);
      inFlightRequest.current = false;
    }
  };
  
  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        loading,
        error,
        checkAnalysis,
        clearAnalysis,
        retryCount
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