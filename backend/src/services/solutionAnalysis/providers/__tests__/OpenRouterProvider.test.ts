import { OpenRouterSolutionAnalysisProvider } from '../OpenRouterSolutionAnalysisProvider';
import { SolutionAnalysisProviderFactory } from '../ProviderFactory';
import { ConfigurationError, AuthenticationError } from '../ProviderErrors';

describe('OpenRouterSolutionAnalysisProvider', () => {
  describe('Provider Factory', () => {
    beforeEach(() => {
      // Clear the provider cache before each test
      SolutionAnalysisProviderFactory.clearCache();
    });

    it('should create an OpenRouter provider instance', () => {
      // Skip if no API key is available
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('Skipping OpenRouter provider test - no API key available');
        return;
      }

      const provider = SolutionAnalysisProviderFactory.getProvider('openrouter');
      expect(provider).toBeInstanceOf(OpenRouterSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('openrouter');
    });

    it('should return cached provider instance on subsequent calls', () => {
      // Skip if no API key is available
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('Skipping OpenRouter provider test - no API key available');
        return;
      }

      const provider1 = SolutionAnalysisProviderFactory.getProvider('openrouter');
      const provider2 = SolutionAnalysisProviderFactory.getProvider('openrouter');
      expect(provider1).toBe(provider2);
    });

    it('should include OpenRouter in available providers list', () => {
      const available = SolutionAnalysisProviderFactory.getAvailableProviders();
      expect(available).toContain('openrouter');
      expect(available).toContain('gemini');
    });

    it('should check OpenRouter provider availability', () => {
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('openrouter')).toBe(true);
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('gemini')).toBe(true);
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('unknown')).toBe(false);
    });
  });

  describe('OpenRouter Provider', () => {
    let provider: OpenRouterSolutionAnalysisProvider;

    beforeEach(() => {
      // Skip if no API key is available (for CI/CD environments)
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('Skipping OpenRouter tests - no API key available');
        return;
      }
      
      provider = new OpenRouterSolutionAnalysisProvider();
    });

    it('should have correct provider name', () => {
      if (!provider) return;
      expect(provider.getProviderName()).toBe('openrouter');
    });

    it('should return configuration object', () => {
      if (!provider) return;
      const config = provider.getConfiguration();
      expect(config.providerName).toBe('openrouter');
      expect(config.model).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.baseUrl).toBeDefined();
    });

    it('should handle health check', async () => {
      if (!provider) return;
      // Note: This will make an actual API call in a real environment
      // Consider mocking for unit tests
      const isHealthy = await provider.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should throw ConfigurationError when API key is missing', () => {
      // Temporarily unset the environment variable
      const originalKey = process.env.OPENROUTER_API_KEY;
      delete process.env.OPENROUTER_API_KEY;
      
      try {
        expect(() => {
          new OpenRouterSolutionAnalysisProvider();
        }).toThrow(ConfigurationError);
      } finally {
        // Restore the original value
        if (originalKey) {
          process.env.OPENROUTER_API_KEY = originalKey;
        }
      }
    });
  });

  describe('Provider Comparison', () => {
    beforeEach(() => {
      SolutionAnalysisProviderFactory.clearCache();
    });

    it('should be able to create both Gemini and OpenRouter providers', () => {
      // Skip if API keys are not available
      if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_PRO_API_KEY) {
        console.log('Skipping Gemini provider test - no API key available');
        return;
      }
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('Skipping OpenRouter provider test - no API key available');
        return;
      }

      const geminiProvider = SolutionAnalysisProviderFactory.getProvider('gemini');
      const openrouterProvider = SolutionAnalysisProviderFactory.getProvider('openrouter');
      
      expect(geminiProvider.getProviderName()).toBe('gemini');
      expect(openrouterProvider.getProviderName()).toBe('openrouter');
      expect(geminiProvider).not.toBe(openrouterProvider);
    });

    it('should return provider health status for all providers', async () => {
      // This test checks the factory method for getting all provider health
      const healthStatus = await SolutionAnalysisProviderFactory.getAllProviderHealth();
      
      expect(typeof healthStatus).toBe('object');
      expect(healthStatus).toHaveProperty('gemini');
      expect(healthStatus).toHaveProperty('openrouter');
      expect(typeof healthStatus.gemini).toBe('boolean');
      expect(typeof healthStatus.openrouter).toBe('boolean');
    });
  });
});