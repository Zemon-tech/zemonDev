import { FallbackSolutionAnalysisProvider } from '../FallbackSolutionAnalysisProvider';
import { SolutionAnalysisProvider } from '../SolutionAnalysisProvider.interface';
import { ICrucibleProblem } from '../../../../models/crucibleProblem.model';
import { ISolutionAnalysisResponse } from '../../../solutionAnalysis.service';
import { 
  AIServiceError, 
  ModelOverloadError, 
  TimeoutError,
  isRetryableProviderError 
} from '../ProviderErrors';

describe('FallbackSolutionAnalysisProvider', () => {
  let mockPrimaryProvider: jest.Mocked<SolutionAnalysisProvider>;
  let mockFallbackProvider: jest.Mocked<SolutionAnalysisProvider>;
  let fallbackProvider: FallbackSolutionAnalysisProvider;

  const mockProblem: ICrucibleProblem = {
    title: 'Test Problem',
    description: 'A test problem',
    expectedOutcome: 'Should work',
    difficulty: 'easy',
    tags: ['test'],
    requirements: {
      functional: [{ requirement: 'Test requirement' }],
      nonFunctional: [{ requirement: 'Performance requirement' }]
    },
    constraints: ['No constraints']
  } as ICrucibleProblem;

  const mockResponse: ISolutionAnalysisResponse = {
    overallScore: 85,
    aiConfidence: 90,
    summary: 'Good solution',
    evaluatedParameters: [],
    feedback: {
      strengths: ['Well implemented'],
      areasForImprovement: ['Could be optimized'],
      suggestions: ['Consider using better patterns']
    }
  };

  beforeEach(() => {
    mockPrimaryProvider = {
      analyzeComprehensively: jest.fn(),
      getProviderName: jest.fn().mockReturnValue('primary'),
      isHealthy: jest.fn(),
      getConfiguration: jest.fn().mockReturnValue({
        providerName: 'primary',
        model: 'test-model'
      })
    };

    mockFallbackProvider = {
      analyzeComprehensively: jest.fn(),
      getProviderName: jest.fn().mockReturnValue('fallback'),
      isHealthy: jest.fn(),
      getConfiguration: jest.fn().mockReturnValue({
        providerName: 'fallback',
        model: 'fallback-model'
      })
    };

    fallbackProvider = new FallbackSolutionAnalysisProvider(
      mockPrimaryProvider,
      mockFallbackProvider
    );
  });

  describe('analyzeComprehensively', () => {
    it('should use primary provider when it succeeds', async () => {
      mockPrimaryProvider.analyzeComprehensively.mockResolvedValue(mockResponse);

      const result = await fallbackProvider.analyzeComprehensively(
        mockProblem,
        'test solution',
        [],
        []
      );

      expect(result).toBe(mockResponse);
      expect(mockPrimaryProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
      expect(mockFallbackProvider.analyzeComprehensively).not.toHaveBeenCalled();
    });

    it('should fallback to secondary provider when primary fails with retryable error', async () => {
      const primaryError = new ModelOverloadError('primary', 'Model overloaded');
      mockPrimaryProvider.analyzeComprehensively.mockRejectedValue(primaryError);
      mockFallbackProvider.analyzeComprehensively.mockResolvedValue(mockResponse);

      const result = await fallbackProvider.analyzeComprehensively(
        mockProblem,
        'test solution',
        [],
        []
      );

      expect(result).toBe(mockResponse);
      expect(mockPrimaryProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
      expect(mockFallbackProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
    });

    it('should fallback to secondary provider when primary fails with network error', async () => {
      const networkError = new Error('Connection timeout');
      mockPrimaryProvider.analyzeComprehensively.mockRejectedValue(networkError);
      mockFallbackProvider.analyzeComprehensively.mockResolvedValue(mockResponse);

      const result = await fallbackProvider.analyzeComprehensively(
        mockProblem,
        'test solution',
        [],
        []
      );

      expect(result).toBe(mockResponse);
      expect(mockPrimaryProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
      expect(mockFallbackProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
    });

    it('should throw primary error when both providers fail', async () => {
      const primaryError = new ModelOverloadError('primary', 'Primary failed');
      const fallbackError = new TimeoutError('fallback', 'Fallback timeout');
      
      mockPrimaryProvider.analyzeComprehensively.mockRejectedValue(primaryError);
      mockFallbackProvider.analyzeComprehensively.mockRejectedValue(fallbackError);

      await expect(
        fallbackProvider.analyzeComprehensively(mockProblem, 'test solution', [], [])
      ).rejects.toBe(primaryError);

      expect(mockPrimaryProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
      expect(mockFallbackProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
    });

    it('should not fallback for non-retryable errors', async () => {
      const authError = new Error('Authentication failed');
      mockPrimaryProvider.analyzeComprehensively.mockRejectedValue(authError);

      await expect(
        fallbackProvider.analyzeComprehensively(mockProblem, 'test solution', [], [])
      ).rejects.toBe(authError);

      expect(mockPrimaryProvider.analyzeComprehensively).toHaveBeenCalledTimes(1);
      expect(mockFallbackProvider.analyzeComprehensively).not.toHaveBeenCalled();
    });
  });

  describe('getProviderName', () => {
    it('should return combined provider names', () => {
      const name = fallbackProvider.getProviderName();
      expect(name).toBe('primary-with-fallback-fallback');
    });
  });

  describe('isHealthy', () => {
    it('should return true if primary provider is healthy', async () => {
      mockPrimaryProvider.isHealthy.mockResolvedValue(true);
      mockFallbackProvider.isHealthy.mockResolvedValue(false);

      const healthy = await fallbackProvider.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should return true if fallback provider is healthy', async () => {
      mockPrimaryProvider.isHealthy.mockResolvedValue(false);
      mockFallbackProvider.isHealthy.mockResolvedValue(true);

      const healthy = await fallbackProvider.isHealthy();
      expect(healthy).toBe(true);
    });

    it('should return false if both providers are unhealthy', async () => {
      mockPrimaryProvider.isHealthy.mockResolvedValue(false);
      mockFallbackProvider.isHealthy.mockResolvedValue(false);

      const healthy = await fallbackProvider.isHealthy();
      expect(healthy).toBe(false);
    });

    it('should return false if health check throws', async () => {
      mockPrimaryProvider.isHealthy.mockRejectedValue(new Error('Health check failed'));
      mockFallbackProvider.isHealthy.mockRejectedValue(new Error('Health check failed'));

      const healthy = await fallbackProvider.isHealthy();
      expect(healthy).toBe(false);
    });
  });

  describe('getConfiguration', () => {
    it('should return configuration for both providers', () => {
      const config = fallbackProvider.getConfiguration();
      
      expect(config.providerName).toBe('primary-with-fallback-fallback');
      expect(config.primaryProvider).toEqual({
        providerName: 'primary',
        model: 'test-model'
      });
      expect(config.fallbackProvider).toEqual({
        providerName: 'fallback',
        model: 'fallback-model'
      });
      expect(config.metrics).toBeDefined();
    });
  });

  describe('metrics tracking', () => {
    it('should track successful analysis metrics', async () => {
      mockPrimaryProvider.analyzeComprehensively.mockResolvedValue(mockResponse);

      await fallbackProvider.analyzeComprehensively(mockProblem, 'test solution', [], []);

      const metrics = fallbackProvider.getMetrics();
      expect(metrics.primary.successCount).toBe(1);
      expect(metrics.primary.failureCount).toBe(0);
      expect(metrics.primary.fallbackCount).toBe(0);
    });

    it('should track failure and fallback metrics', async () => {
      const primaryError = new ModelOverloadError('primary', 'Model overloaded');
      mockPrimaryProvider.analyzeComprehensively.mockRejectedValue(primaryError);
      mockFallbackProvider.analyzeComprehensively.mockResolvedValue(mockResponse);

      await fallbackProvider.analyzeComprehensively(mockProblem, 'test solution', [], []);

      const metrics = fallbackProvider.getMetrics();
      expect(metrics.primary.successCount).toBe(0);
      expect(metrics.primary.failureCount).toBe(1);
      expect(metrics.fallback.successCount).toBe(1);
      expect(metrics.fallback.fallbackCount).toBe(1);
    });
  });

  describe('shouldAttemptFallback', () => {
    it('should identify retryable provider errors correctly', () => {
      const retryableError = new ModelOverloadError('test', 'Overloaded');
      expect(isRetryableProviderError(retryableError)).toBe(true);
    });

    it('should identify network errors correctly', () => {
      const networkErrors = [
        new Error('Connection timeout'),
        new Error('ECONNRESET'),
        new Error('503 Service Unavailable'),
        new Error('Network error occurred')
      ];

      // We need to test the private method indirectly through the public interface
      networkErrors.forEach(async (error) => {
        mockPrimaryProvider.analyzeComprehensively.mockRejectedValueOnce(error);
        mockFallbackProvider.analyzeComprehensively.mockResolvedValueOnce(mockResponse);

        await fallbackProvider.analyzeComprehensively(mockProblem, 'test', [], []);
        expect(mockFallbackProvider.analyzeComprehensively).toHaveBeenCalled();
      });
    });
  });
});