import { ICrucibleProblem } from '../../../models/crucibleProblem.model';
import { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';

/**
 * Interface for solution analysis providers
 * Provides a contract for implementing different AI providers (Gemini, OpenRouter, etc.)
 * for comprehensive solution analysis
 */
export interface SolutionAnalysisProvider {
  /**
   * Performs comprehensive analysis of a user's solution
   * @param problemDetails - The crucible problem details
   * @param userSolution - The user's submitted solution code/text
   * @param ragDocuments - Relevant documents from the RAG system for context
   * @param technicalParameters - Specific parameters to evaluate the solution against
   * @returns Promise resolving to structured analysis response
   */
  analyzeComprehensively(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): Promise<ISolutionAnalysisResponse>;
  
  /**
   * Returns the provider name for logging and identification
   * @returns String identifier for the provider (e.g., 'gemini', 'openrouter')
   */
  getProviderName(): string;
  
  /**
   * Checks if the provider is healthy and ready to process requests
   * @returns Promise resolving to boolean indicating health status
   */
  isHealthy(): Promise<boolean>;
  
  /**
   * Gets the provider configuration information (without sensitive data)
   * @returns Object containing non-sensitive configuration details
   */
  getConfiguration(): {
    providerName: string;
    model?: string;
    timeout?: number;
    [key: string]: any;
  };
}