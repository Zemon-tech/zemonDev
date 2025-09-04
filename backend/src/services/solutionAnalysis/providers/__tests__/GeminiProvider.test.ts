import { GeminiSolutionAnalysisProvider } from '../GeminiSolutionAnalysisProvider';
import { SolutionAnalysisProviderFactory } from '../ProviderFactory';
import { ConfigurationError } from '../ProviderErrors';

describe('GeminiSolutionAnalysisProvider', () => {
  describe('Provider Factory', () => {
    beforeEach(() => {
      // Clear the provider cache before each test
      SolutionAnalysisProviderFactory.clearCache();
    });

    it('should create a Gemini provider instance', () => {
      const provider = SolutionAnalysisProviderFactory.getProvider('gemini');
      expect(provider).toBeInstanceOf(GeminiSolutionAnalysisProvider);
      expect(provider.getProviderName()).toBe('gemini');
    });

    it('should return cached provider instance on subsequent calls', () => {
      const provider1 = SolutionAnalysisProviderFactory.getProvider('gemini');
      const provider2 = SolutionAnalysisProviderFactory.getProvider('gemini');
      expect(provider1).toBe(provider2);
    });

    it('should throw error for unknown provider', () => {
      expect(() => {
        SolutionAnalysisProviderFactory.getProvider('unknown');
      }).toThrow(ConfigurationError);
    });

    it('should throw error for OpenRouter provider (not yet implemented)', () => {
      expect(() => {
        SolutionAnalysisProviderFactory.getProvider('openrouter');
      }).toThrow('OpenRouter provider not yet implemented');
    });

    it('should return available providers list', () => {
      const available = SolutionAnalysisProviderFactory.getAvailableProviders();
      expect(available).toEqual(['gemini']);
    });

    it('should check provider availability', () => {
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('gemini')).toBe(true);
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('openrouter')).toBe(false);
      expect(SolutionAnalysisProviderFactory.isProviderAvailable('unknown')).toBe(false);
    });
  });

  describe('Gemini Provider', () => {
    let provider: GeminiSolutionAnalysisProvider;

    beforeEach(() => {
      // Skip if no API key is available (for CI/CD environments)
      if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_PRO_API_KEY) {
        console.log('Skipping Gemini tests - no API key available');
        return;
      }
      
      provider = new GeminiSolutionAnalysisProvider();
    });

    it('should have correct provider name', () => {
      if (!provider) return;
      expect(provider.getProviderName()).toBe('gemini');
    });

    it('should return configuration object', () => {
      if (!provider) return;
      const config = provider.getConfiguration();
      expect(config.providerName).toBe('gemini');
      expect(config.model).toBeDefined();
      expect(config.timeout).toBeDefined();
    });

    it('should handle health check', async () => {
      if (!provider) return;
      // Note: This will make an actual API call in a real environment
      // Consider mocking for unit tests
      const isHealthy = await provider.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});