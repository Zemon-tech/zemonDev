import { SolutionAnalysisProviderFactory } from '../ProviderFactory';
import { FallbackSolutionAnalysisProvider } from '../FallbackSolutionAnalysisProvider';
import { GeminiSolutionAnalysisProvider } from '../GeminiSolutionAnalysisProvider';
import { OpenRouterSolutionAnalysisProvider } from '../OpenRouterSolutionAnalysisProvider';

// Mock environment variables
const originalEnv = process.env;

describe('ProviderFactory Fallback Integration', () => {
  beforeEach(() => {
    // Clear provider cache before each test
    SolutionAnalysisProviderFactory.clearCache();
    
    // Reset environment
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('when ENABLE_ANALYSIS_FALLBACK is true', () => {
    beforeEach(() => {
      process.env.ENABLE_ANALYSIS_FALLBACK = 'true';
      process.env.ANALYSIS_PROVIDER = 'openrouter';
      process.env.ANALYSIS_FALLBACK_PROVIDER = 'gemini';
      
      // Mock API keys to prevent initialization errors
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
    });

    it('should return FallbackSolutionAnalysisProvider when primary provider is requested', () => {
      const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
      
      expect(provider).toBeInstanceOf(FallbackSolutionAnalysisProvider);
      expect(provider.getProviderName()).toContain('openrouter-with-gemini-fallback');
    });

    it('should return raw provider when getRawProvider is called', () => {
      const provider = SolutionAnalysisProviderFactory.getRawProvider('openrouter');
      
      expect(provider).toBeInstanceOf(OpenRouterSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('openrouter');
    });

    it('should return fallback provider correctly', () => {
      const provider = SolutionAnalysisProviderFactory.getFallbackProvider();
      
      expect(provider).toBeInstanceOf(GeminiSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('gemini');
    });

    it('should cache fallback providers correctly', () => {
      const provider1 = SolutionAnalysisProviderFactory.getPrimaryProvider();
      const provider2 = SolutionAnalysisProviderFactory.getPrimaryProvider();
      
      expect(provider1).toBe(provider2); // Should be the same cached instance
    });

    it('should handle different primary provider configurations', () => {
      process.env.ANALYSIS_PROVIDER = 'gemini';
      process.env.ANALYSIS_FALLBACK_PROVIDER = 'openrouter';
      
      // Clear cache to pick up new configuration
      SolutionAnalysisProviderFactory.clearCache();
      
      const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
      
      expect(provider).toBeInstanceOf(FallbackSolutionAnalysisProvider);
      expect(provider.getProviderName()).toContain('gemini-with-openrouter-fallback');
    });
  });

  describe('when ENABLE_ANALYSIS_FALLBACK is false', () => {
    beforeEach(() => {
      process.env.ENABLE_ANALYSIS_FALLBACK = 'false';
      process.env.ANALYSIS_PROVIDER = 'openrouter';
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    });

    it('should return raw provider directly without fallback wrapping', () => {
      const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
      
      expect(provider).toBeInstanceOf(OpenRouterSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('openrouter');
    });
  });

  describe('when ENABLE_ANALYSIS_FALLBACK is undefined', () => {
    beforeEach(() => {
      delete process.env.ENABLE_ANALYSIS_FALLBACK;
      process.env.ANALYSIS_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
    });

    it('should return raw provider directly without fallback wrapping', () => {
      const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
      
      expect(provider).toBeInstanceOf(GeminiSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('gemini');
    });
  });

  describe('error handling', () => {
    it('should throw error when fallback is enabled but primary provider fails to initialize', () => {
      process.env.ENABLE_ANALYSIS_FALLBACK = 'true';
      process.env.ANALYSIS_PROVIDER = 'openrouter';
      process.env.ANALYSIS_FALLBACK_PROVIDER = 'gemini';
      // Don't set API keys to trigger initialization error
      delete process.env.OPENROUTER_API_KEY;
      delete process.env.GEMINI_API_KEY;

      expect(() => {
        SolutionAnalysisProviderFactory.getPrimaryProvider();
      }).toThrow();
    });

    it('should throw error when fallback is enabled but fallback provider fails to initialize', () => {
      process.env.ENABLE_ANALYSIS_FALLBACK = 'true';
      process.env.ANALYSIS_PROVIDER = 'openrouter';
      process.env.ANALYSIS_FALLBACK_PROVIDER = 'gemini';
      process.env.OPENROUTER_API_KEY = 'test-key';
      // Don't set fallback API key
      delete process.env.GEMINI_API_KEY;

      expect(() => {
        SolutionAnalysisProviderFactory.getPrimaryProvider();
      }).toThrow();
    });
  });

  describe('configuration validation', () => {
    it('should include fallback configuration in provider config', () => {
      process.env.ENABLE_ANALYSIS_FALLBACK = 'true';
      process.env.ANALYSIS_PROVIDER = 'openrouter';
      process.env.ANALYSIS_FALLBACK_PROVIDER = 'gemini';
      process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
      const config = provider.getConfiguration();

      expect(config.providerName).toContain('fallback');
      expect(config.primaryProvider).toBeDefined();
      expect(config.fallbackProvider).toBeDefined();
      expect(config.metrics).toBeDefined();
    });
  });
});