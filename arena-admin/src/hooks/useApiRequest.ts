import { useState, useCallback } from 'react';
import ApiService, { ApiError } from '../services/api.service';

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type ApiRequestMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Custom hook for handling API requests
 */
function useApiRequest<T>(initialData: T | null = null) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  /**
   * Execute an API request
   */
  const executeRequest = useCallback(async (
    method: ApiRequestMethod,
    endpoint: string,
    data?: any
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let response;
      
      switch (method) {
        case 'get':
          response = await ApiService.get<T>(endpoint);
          break;
        case 'post':
          response = await ApiService.post<T>(endpoint, data);
          break;
        case 'put':
          response = await ApiService.put<T>(endpoint, data);
          break;
        case 'delete':
          response = await ApiService.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Invalid method: ${method}`);
      }
      
      setState({
        data: response,
        loading: false,
        error: null,
      });
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
        
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, []);

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    executeRequest,
    reset,
  };
}

export default useApiRequest; 