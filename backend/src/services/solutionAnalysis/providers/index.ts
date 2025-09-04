/**
 * Barrel export file for solution analysis providers
 * Centralizes all provider-related exports for easier imports
 */

// Core interfaces
export { SolutionAnalysisProvider } from './SolutionAnalysisProvider.interface';

// Base implementation
export { BaseSolutionAnalysisProvider } from './BaseSolutionAnalysisProvider';

// Concrete providers
export { GeminiSolutionAnalysisProvider } from './GeminiSolutionAnalysisProvider';
export { OpenRouterSolutionAnalysisProvider } from './OpenRouterSolutionAnalysisProvider';
export { FallbackSolutionAnalysisProvider } from './FallbackSolutionAnalysisProvider';

// Provider factory
export { SolutionAnalysisProviderFactory } from './ProviderFactory';

// Error types
export {
  SolutionAnalysisProviderError,
  ModelOverloadError,
  ResponseParsingError,
  AIServiceError,
  AuthenticationError,
  TimeoutError,
  ConfigurationError,
  HealthCheckError,
  isRetryableProviderError,
  isProviderError,
  mapToProviderError
} from './ProviderErrors';

// Re-export solution analysis types for convenience
export { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';
export { IAnalysisParameter } from '../../../models/solutionAnalysis.model';