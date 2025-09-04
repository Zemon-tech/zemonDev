/**
 * Custom error types for solution analysis providers
 * These errors provide specific handling for different failure scenarios
 */

/**
 * Base class for all solution analysis provider errors
 */
export abstract class SolutionAnalysisProviderError extends Error {
  abstract readonly errorCode: string;
  abstract readonly isRetryable: boolean;
  
  constructor(message: string, public readonly provider: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the AI model is overloaded or rate-limited
 */
export class ModelOverloadError extends SolutionAnalysisProviderError {
  readonly errorCode = 'MODEL_OVERLOADED';
  readonly isRetryable = true;
  
  constructor(provider: string, message: string = 'AI model is currently overloaded. Please try again later.') {
    super(message, provider);
  }
}

/**
 * Thrown when response parsing fails
 */
export class ResponseParsingError extends SolutionAnalysisProviderError {
  readonly errorCode = 'RESPONSE_PARSING_ERROR';
  readonly isRetryable = false;
  
  constructor(provider: string, message: string = 'Failed to parse AI response.', public readonly rawResponse?: string) {
    super(message, provider);
  }
}

/**
 * Thrown when the AI service returns an error
 */
export class AIServiceError extends SolutionAnalysisProviderError {
  readonly errorCode = 'AI_SERVICE_ERROR';
  readonly isRetryable = true;
  
  constructor(provider: string, message: string = 'AI service error occurred.', public readonly statusCode?: number) {
    super(message, provider);
  }
}

/**
 * Thrown when API authentication fails
 */
export class AuthenticationError extends SolutionAnalysisProviderError {
  readonly errorCode = 'AUTHENTICATION_ERROR';
  readonly isRetryable = false;
  
  constructor(provider: string, message: string = 'API authentication failed.') {
    super(message, provider);
  }
}

/**
 * Thrown when the request times out
 */
export class TimeoutError extends SolutionAnalysisProviderError {
  readonly errorCode = 'TIMEOUT_ERROR';
  readonly isRetryable = true;
  
  constructor(provider: string, message: string = 'Request timed out.', public readonly timeoutMs?: number) {
    super(message, provider);
  }
}

/**
 * Thrown when the provider configuration is invalid
 */
export class ConfigurationError extends SolutionAnalysisProviderError {
  readonly errorCode = 'CONFIGURATION_ERROR';
  readonly isRetryable = false;
  
  constructor(provider: string, message: string = 'Provider configuration is invalid.') {
    super(message, provider);
  }
}

/**
 * Thrown when the provider fails health checks
 */
export class HealthCheckError extends SolutionAnalysisProviderError {
  readonly errorCode = 'HEALTH_CHECK_ERROR';
  readonly isRetryable = true;
  
  constructor(provider: string, message: string = 'Provider health check failed.') {
    super(message, provider);
  }
}

/**
 * Type guard to check if an error is a retryable provider error
 */
export function isRetryableProviderError(error: unknown): error is SolutionAnalysisProviderError & { isRetryable: true } {
  return error instanceof SolutionAnalysisProviderError && error.isRetryable;
}

/**
 * Type guard to check if an error is a provider error
 */
export function isProviderError(error: unknown): error is SolutionAnalysisProviderError {
  return error instanceof SolutionAnalysisProviderError;
}

/**
 * Maps generic errors to appropriate provider error types
 */
export function mapToProviderError(error: unknown, provider: string): SolutionAnalysisProviderError {
  if (error instanceof SolutionAnalysisProviderError) {
    return error;
  }
  
  const errorObj = error as any;
  const message = errorObj?.message || 'Unknown error occurred';
  
  // Check for specific error patterns
  if (errorObj?.status >= 500 || message.includes('Internal Server Error')) {
    return new AIServiceError(provider, message, errorObj?.status);
  }
  
  if (errorObj?.status === 401 || errorObj?.status === 403 || message.includes('auth')) {
    return new AuthenticationError(provider, message);
  }
  
  if (errorObj?.status === 429 || message.includes('rate limit') || message.includes('overload')) {
    return new ModelOverloadError(provider, message);
  }
  
  if (message.includes('timeout') || errorObj?.code === 'ETIMEDOUT') {
    return new TimeoutError(provider, message);
  }
  
  if (message.includes('parse') || message.includes('JSON')) {
    return new ResponseParsingError(provider, message);
  }
  
  // Default to AI service error for unknown errors
  return new AIServiceError(provider, message, errorObj?.status);
}