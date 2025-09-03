import { AIProvider } from '../services/ai.service';

export interface AIConfig {
  provider: AIProvider;
  openrouter: {
    apiKey: string;
    model: string;
    baseUrl: string;
    appName?: string;
    siteUrl?: string;
  };
  gemini: {
    apiKey: string;
  };
  webSearch: {
    enabled: boolean;
    provider: 'openrouter' | 'serpapi';
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the AI configuration from environment variables
 * @returns ValidationResult with errors and warnings
 */
export const validateAIConfig = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get environment variables
  const provider = (process.env.AI_PROVIDER?.toLowerCase() as AIProvider) || 'gemini';
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const webSearchEnabled = process.env.ENABLE_WEB_SEARCH?.toLowerCase() === 'true';
  const webSearchProvider = (process.env.WEB_SEARCH_PROVIDER?.toLowerCase() as 'openrouter' | 'serpapi') || 'serpapi';

  // Validate provider selection
  if (!['openrouter', 'gemini'].includes(provider)) {
    errors.push(`Invalid AI_PROVIDER: "${process.env.AI_PROVIDER}". Must be "openrouter" or "gemini".`);
  }

  // Validate primary provider configuration
  if (provider === 'openrouter') {
    if (!openrouterApiKey) {
      errors.push('OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter');
    } else if (openrouterApiKey.length < 10) {
      errors.push('OPENROUTER_API_KEY appears to be invalid (too short)');
    }

    // Validate OpenRouter model format
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
    if (!model.includes('/')) {
      warnings.push(`OPENROUTER_MODEL "${model}" should be in format "provider/model" (e.g., "openai/gpt-4o-mini")`);
    }

    // Check for fallback Gemini key
    if (!geminiApiKey) {
      warnings.push('GEMINI_API_KEY not found. OpenRouter failures will not have Gemini fallback.');
    }
  } else if (provider === 'gemini') {
    if (!geminiApiKey) {
      errors.push('GEMINI_API_KEY is required when AI_PROVIDER=gemini');
    } else if (geminiApiKey.length < 10) {
      errors.push('GEMINI_API_KEY appears to be invalid (too short)');
    }
  }

  // Validate web search configuration
  if (webSearchEnabled) {
    if (webSearchProvider === 'serpapi') {
      const serpApiKey = process.env.SERPAPI_KEY;
      if (!serpApiKey) {
        warnings.push('SERPAPI_KEY not found. Web search functionality will be limited.');
      }
    } else if (webSearchProvider === 'openrouter') {
      if (provider !== 'openrouter') {
        warnings.push('WEB_SEARCH_PROVIDER=openrouter requires AI_PROVIDER=openrouter');
      }
      const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';
      if (!model.includes(':online')) {
        warnings.push(`OpenRouter web search requires ":online" model suffix. Current: "${model}"`);
      }
    }
  }

  // Validate OpenRouter optional configuration
  if (provider === 'openrouter') {
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    if (baseUrl && !baseUrl.startsWith('https://')) {
      warnings.push('OPENROUTER_BASE_URL should use HTTPS for security');
    }

    const referer = process.env.OPENROUTER_REFERER;
    if (referer && !referer.startsWith('http')) {
      warnings.push('OPENROUTER_REFERER should be a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Gets the validated AI configuration from environment variables
 * @returns AIConfig object
 * @throws Error if configuration is invalid
 */
export const getAIConfig = (): AIConfig => {
  const validation = validateAIConfig();
  
  if (!validation.isValid) {
    throw new Error(`AI Configuration Error:\n${validation.errors.join('\n')}`);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('AI Configuration Warnings:');
    validation.warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
  }

  const provider = (process.env.AI_PROVIDER?.toLowerCase() as AIProvider) || 'gemini';

  return {
    provider,
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      appName: process.env.OPENROUTER_TITLE || 'Quild AI Chat',
      siteUrl: process.env.OPENROUTER_REFERER || 'http://localhost:5173'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || ''
    },
    webSearch: {
      enabled: process.env.ENABLE_WEB_SEARCH?.toLowerCase() === 'true',
      provider: (process.env.WEB_SEARCH_PROVIDER?.toLowerCase() as 'openrouter' | 'serpapi') || 'serpapi'
    }
  };
};

/**
 * Logs the current AI configuration (without sensitive data)
 */
export const logAIConfig = (): void => {
  try {
    const config = getAIConfig();
    console.log('🤖 AI Configuration:');
    console.log(`   Provider: ${config.provider}`);
    console.log(`   OpenRouter Model: ${config.openrouter.model}`);
    console.log(`   Web Search: ${config.webSearch.enabled ? 'enabled' : 'disabled'} (${config.webSearch.provider})`);
    console.log(`   Fallback Available: ${config.gemini.apiKey ? 'yes' : 'no'}`);
  } catch (error) {
    console.error('❌ AI Configuration Error:', error instanceof Error ? error.message : error);
  }
};
