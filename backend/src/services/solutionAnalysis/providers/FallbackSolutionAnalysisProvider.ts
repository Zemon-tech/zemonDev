import { ICrucibleProblem } from '../../../models/crucibleProblem.model';
import { SolutionAnalysisProvider } from './SolutionAnalysisProvider.interface';
import { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';
import { isRetryableProviderError } from './ProviderErrors';

/**
 * Provider metrics for tracking performance and reliability
 */
interface ProviderMetrics {
  successCount: number;
  failureCount: number;
  fallbackCount: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  totalResponseTime: number;
  averageResponseTime: number;
}

/**
 * Fallback Solution Analysis Provider
 * Wraps a primary and fallback provider to ensure high availability
 */
export class FallbackSolutionAnalysisProvider implements SolutionAnalysisProvider {
  private readonly primaryProvider: SolutionAnalysisProvider;
  private readonly fallbackProvider: SolutionAnalysisProvider;
  private readonly metrics: Map<string, ProviderMetrics> = new Map();

  constructor(primaryProvider: SolutionAnalysisProvider, fallbackProvider: SolutionAnalysisProvider) {
    this.primaryProvider = primaryProvider;
    this.fallbackProvider = fallbackProvider;
    
    // Initialize metrics for both providers
    this.initializeMetrics(primaryProvider.getProviderName());
    this.initializeMetrics(fallbackProvider.getProviderName());
    
    console.log(`[FallbackProvider] Initialized with primary: ${primaryProvider.getProviderName()}, fallback: ${fallbackProvider.getProviderName()}`);
  }

  /**
   * Performs comprehensive analysis with automatic fallback capability
   */
  async analyzeComprehensively(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): Promise<ISolutionAnalysisResponse> {
    const startTime = Date.now();
    
    // Try primary provider first
    try {
      console.log(`[FallbackProvider] Attempting analysis with primary provider: ${this.primaryProvider.getProviderName()}`);
      
      const result = await this.primaryProvider.analyzeComprehensively(
        problemDetails,
        userSolution,
        ragDocuments,
        technicalParameters
      );
      
      const responseTime = Date.now() - startTime;
      this.recordSuccess(this.primaryProvider.getProviderName(), responseTime);
      
      console.log(`[FallbackProvider] Primary provider ${this.primaryProvider.getProviderName()} succeeded in ${responseTime}ms`);
      return result;
      
    } catch (primaryError) {
      const responseTime = Date.now() - startTime;
      this.recordFailure(this.primaryProvider.getProviderName(), primaryError);
      
      console.warn(`[FallbackProvider] Primary provider ${this.primaryProvider.getProviderName()} failed after ${responseTime}ms:`, 
        primaryError instanceof Error ? primaryError.message : primaryError);
      
      // Check if error is retryable and if we should attempt fallback
      const shouldFallback = this.shouldAttemptFallback(primaryError);
      
      if (!shouldFallback) {
        console.log(`[FallbackProvider] Error is non-retryable, not attempting fallback`);
        throw primaryError;
      }
      
      // Attempt fallback
      let fallbackStartTime: number = Date.now();
      try {
        console.log(`[FallbackProvider] Attempting fallback to: ${this.fallbackProvider.getProviderName()}`);
        this.recordFallbackAttempt(this.fallbackProvider.getProviderName());
        
        fallbackStartTime = Date.now();
        const result = await this.fallbackProvider.analyzeComprehensively(
          problemDetails,
          userSolution,
          ragDocuments,
          technicalParameters
        );
        
        const fallbackResponseTime = Date.now() - fallbackStartTime;
        this.recordSuccess(this.fallbackProvider.getProviderName(), fallbackResponseTime);
        
        console.log(`[FallbackProvider] Fallback provider ${this.fallbackProvider.getProviderName()} succeeded in ${fallbackResponseTime}ms`);
        return result;
        
      } catch (fallbackError) {
        const fallbackResponseTime = Date.now() - fallbackStartTime;
        this.recordFailure(this.fallbackProvider.getProviderName(), fallbackError);
        
        console.error(`[FallbackProvider] Fallback provider ${this.fallbackProvider.getProviderName()} also failed after ${fallbackResponseTime}ms:`, 
          fallbackError instanceof Error ? fallbackError.message : fallbackError);
        
        // Throw the original primary error since fallback also failed
        throw primaryError;
      }
    }
  }

  /**
   * Returns a combined provider name indicating fallback capability
   */
  getProviderName(): string {
    return `${this.primaryProvider.getProviderName()}-with-${this.fallbackProvider.getProviderName()}-fallback`;
  }

  /**
   * Checks health of both providers
   */
  async isHealthy(): Promise<boolean> {
    try {
      const [primaryHealthy, fallbackHealthy] = await Promise.all([
        this.primaryProvider.isHealthy(),
        this.fallbackProvider.isHealthy()
      ]);
      
      // At least one provider should be healthy for the fallback system to be considered healthy
      const isHealthy = primaryHealthy || fallbackHealthy;
      
      console.log(`[FallbackProvider] Health check - Primary: ${primaryHealthy}, Fallback: ${fallbackHealthy}, Overall: ${isHealthy}`);
      return isHealthy;
      
    } catch (error) {
      console.error(`[FallbackProvider] Health check failed:`, error);
      return false;
    }
  }

  /**
   * Gets configuration for both providers
   */
  getConfiguration(): {
    providerName: string;
    model?: string;
    timeout?: number;
    [key: string]: any;
  } {
    return {
      providerName: this.getProviderName(),
      primaryProvider: this.primaryProvider.getConfiguration(),
      fallbackProvider: this.fallbackProvider.getConfiguration(),
      metrics: this.getMetrics()
    };
  }

  /**
   * Gets performance metrics for both providers
   */
  getMetrics(): Record<string, ProviderMetrics> {
    const result: Record<string, ProviderMetrics> = {};
    for (const [provider, metrics] of this.metrics.entries()) {
      result[provider] = { ...metrics };
    }
    return result;
  }

  /**
   * Determines if fallback should be attempted based on the error type
   */
  private shouldAttemptFallback(error: unknown): boolean {
    // Always attempt fallback for retryable provider errors
    if (isRetryableProviderError(error)) {
      return true;
    }
    
    // Attempt fallback for network-related errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const networkErrorKeywords = [
        'network', 'timeout', 'connection', 'econnreset', 'enotfound', 
        'etimedout', 'econnrefused', '503', '502', '504', '500'
      ];
      
      return networkErrorKeywords.some(keyword => message.includes(keyword));
    }
    
    return false;
  }

  /**
   * Initialize metrics for a provider
   */
  private initializeMetrics(providerName: string): void {
    this.metrics.set(providerName, {
      successCount: 0,
      failureCount: 0,
      fallbackCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0
    });
  }

  /**
   * Record a successful analysis
   */
  private recordSuccess(providerName: string, responseTime: number): void {
    const metrics = this.metrics.get(providerName);
    if (metrics) {
      metrics.successCount++;
      metrics.lastSuccess = new Date();
      metrics.totalResponseTime += responseTime;
      metrics.averageResponseTime = metrics.totalResponseTime / metrics.successCount;
    }
  }

  /**
   * Record a failed analysis
   */
  private recordFailure(providerName: string, error: unknown): void {
    const metrics = this.metrics.get(providerName);
    if (metrics) {
      metrics.failureCount++;
      metrics.lastFailure = new Date();
    }
  }

  /**
   * Record a fallback attempt
   */
  private recordFallbackAttempt(providerName: string): void {
    const metrics = this.metrics.get(providerName);
    if (metrics) {
      metrics.fallbackCount++;
    }
  }
}