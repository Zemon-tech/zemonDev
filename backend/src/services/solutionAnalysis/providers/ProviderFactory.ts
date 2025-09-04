import { SolutionAnalysisProvider } from './SolutionAnalysisProvider.interface';
import { GeminiSolutionAnalysisProvider } from './GeminiSolutionAnalysisProvider';
import { OpenRouterSolutionAnalysisProvider } from './OpenRouterSolutionAnalysisProvider';
import { FallbackSolutionAnalysisProvider } from './FallbackSolutionAnalysisProvider';
import { ConfigurationError } from './ProviderErrors';
import { getAIConfig } from '../../../config/ai.config';
import env from '../../../config/env';

/**
 * Factory class for creating solution analysis providers
 * Handles provider instantiation based on configuration
 */
export class SolutionAnalysisProviderFactory {
  private static providers: Map<string, SolutionAnalysisProvider> = new Map();

  /**
   * Creates or retrieves a provider instance based on the provider name
   * @param providerName - The name of the provider to create ('gemini' | 'openrouter')
   * @returns A provider instance
   */
  static getProvider(providerName?: string): SolutionAnalysisProvider {
    const config = getAIConfig();
    const targetProvider = providerName || config.solutionAnalysisProvider;

    // Return cached instance if available
    if (this.providers.has(targetProvider)) {
      return this.providers.get(targetProvider)!;
    }

    // Create new provider instance
    let provider: SolutionAnalysisProvider;

    switch (targetProvider.toLowerCase()) {
      case 'gemini':
        provider = new GeminiSolutionAnalysisProvider();
        break;
      
      case 'openrouter':
        provider = new OpenRouterSolutionAnalysisProvider();
        break;
      
      default:
        throw new ConfigurationError(targetProvider, `Unknown provider: "${targetProvider}". Supported providers: gemini, openrouter`);
    }

    // Cache the provider instance
    this.providers.set(targetProvider, provider);
    
    console.log(`[ProviderFactory] Created ${targetProvider} provider instance`);
    return provider;
  }

  /**
   * Gets the primary provider based on configuration
   * Automatically wraps with fallback provider if enabled
   */
  static getPrimaryProvider(): SolutionAnalysisProvider {
    const config = getAIConfig();
    const enableFallback = env.ENABLE_ANALYSIS_FALLBACK;
    
    // Get the primary provider based on configuration
    const primaryProvider = this.getProvider();
    
    // If fallback is disabled or primary is already Gemini, return as-is
    if (!enableFallback || config.solutionAnalysisProvider === 'gemini') {
      console.log(`[ProviderFactory] Fallback disabled or primary is Gemini, returning: ${primaryProvider.getProviderName()}`);
      return primaryProvider;
    }
    
    // Create fallback provider (always Gemini)
    const fallbackProvider = this.getProvider('gemini');
    
    // Wrap with fallback capability
    const fallbackWrapper = new FallbackSolutionAnalysisProvider(primaryProvider, fallbackProvider);
    console.log(`[ProviderFactory] Created fallback-enabled provider: ${fallbackWrapper.getProviderName()}`);
    
    return fallbackWrapper;
  }

  /**
   * Gets the fallback provider (currently always Gemini)
   */
  static getFallbackProvider(): SolutionAnalysisProvider {
    return this.getProvider('gemini');
  }

  /**
   * Gets a raw provider without fallback wrapping
   * Useful for testing or when fallback is not desired
   */
  static getRawProvider(providerName?: string): SolutionAnalysisProvider {
    return this.getProvider(providerName);
  }

  /**
   * Clears the provider cache (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
    console.log('[ProviderFactory] Provider cache cleared');
  }

  /**
   * Gets all available provider names
   */
  static getAvailableProviders(): string[] {
    return ['gemini', 'openrouter'];
  }

  /**
   * Checks if a provider is available
   */
  static isProviderAvailable(providerName: string): boolean {
    return this.getAvailableProviders().includes(providerName.toLowerCase());
  }

  /**
   * Gets provider health status for all available providers
   */
  static async getAllProviderHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    
    for (const providerName of this.getAvailableProviders()) {
      try {
        const provider = this.getProvider(providerName);
        healthStatus[providerName] = await provider.isHealthy();
      } catch (error) {
        console.warn(`[ProviderFactory] Failed to check health for ${providerName}:`, error);
        healthStatus[providerName] = false;
      }
    }
    
    return healthStatus;
  }
}