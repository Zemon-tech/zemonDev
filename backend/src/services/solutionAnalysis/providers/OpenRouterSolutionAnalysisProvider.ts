import { ICrucibleProblem } from '../../../models/crucibleProblem.model';
import { BaseSolutionAnalysisProvider } from './BaseSolutionAnalysisProvider';
import { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';
import { 
  ModelOverloadError, 
  ResponseParsingError, 
  AIServiceError, 
  AuthenticationError,
  ConfigurationError,
  TimeoutError,
  mapToProviderError
} from './ProviderErrors';
import { getAIConfig } from '../../../config/ai.config';

/**
 * OpenRouter implementation of the solution analysis provider
 * Uses OpenRouter API with Claude 3.5 Sonnet for comprehensive solution analysis
 */
export class OpenRouterSolutionAnalysisProvider extends BaseSolutionAnalysisProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly appName: string;
  private readonly siteUrl: string;

  constructor() {
    super();
    
    // Get configuration
    const config = getAIConfig();
    
    if (!config.openrouter.apiKey) {
      throw new ConfigurationError('openrouter', 'OPENROUTER_API_KEY is required for OpenRouter provider');
    }

    this.apiKey = config.openrouter.apiKey;
    this.model = config.openrouter.analysisModel;
    this.baseUrl = config.openrouter.baseUrl;
    this.timeout = config.analysis.timeout;
    this.appName = config.openrouter.appName || 'Zemon AI Tutor';
    this.siteUrl = config.openrouter.siteUrl || 'http://localhost:5173';
    
    this.logProviderInfo('Initialized with model:', this.model);
  }

  /**
   * Performs comprehensive analysis using OpenRouter API
   */
  async analyzeComprehensively(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): Promise<ISolutionAnalysisResponse> {
    this.logProviderInfo('Starting comprehensive analysis');

    try {
      // Build the analysis prompt using the shared base class method
      const prompt = this.buildAnalysisPrompt(problemDetails, userSolution, ragDocuments, technicalParameters);

      // Execute analysis with retry logic
      const responseText = await this.retryWithBackoff(
        async () => this.callOpenRouterAPI(prompt),
        'OpenRouter API call'
      );

      if (!responseText) {
        throw new AIServiceError('openrouter', 'Empty response from OpenRouter after retries.');
      }

      // Parse and validate the response
      const analysisResult = this.parseAndValidateResponse(responseText);
      
      this.logProviderInfo('Analysis completed successfully');
      return analysisResult;

    } catch (error) {
      this.logProviderError('Analysis failed:', error);
      
      // Map to appropriate provider error
      throw mapToProviderError(error, 'openrouter');
    }
  }

  /**
   * Returns the provider name
   */
  getProviderName(): string {
    return 'openrouter';
  }

  /**
   * Checks if the OpenRouter provider is healthy and ready
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check by making a minimal API call
      const response = await this.makeOpenRouterRequest('/models', {}, 'GET');
      return Boolean(response && response.data);
    } catch (error) {
      this.logProviderWarning('Health check failed:', error);
      return false;
    }
  }

  /**
   * Gets the provider configuration (without sensitive data)
   */
  getConfiguration(): {
    providerName: string;
    model?: string;
    timeout?: number;
    [key: string]: any;
  } {
    return {
      providerName: this.getProviderName(),
      model: this.model,
      timeout: this.timeout,
      baseUrl: this.baseUrl,
      maxRetries: this.MAX_ATTEMPTS,
      retryDelayBase: this.RETRY_DELAY_BASE
    };
  }

  /**
   * Calls the OpenRouter API for solution analysis
   */
  private async callOpenRouterAPI(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Prepare the request body for OpenRouter
      const requestBody = {
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a world-class AI system architect and neutral evaluator. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 8192,
        top_p: 0.95
      };

      this.logProviderInfo('Sending request to OpenRouter API');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.appName
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific OpenRouter error status codes
        switch (response.status) {
          case 401:
          case 403:
            throw new AuthenticationError('openrouter', `Invalid API key or insufficient permissions: ${errorData.error?.message || 'Authentication failed'}`);
          case 429:
            throw new ModelOverloadError('openrouter', `Rate limit exceeded: ${errorData.error?.message || 'Too many requests'}`);
          case 503:
            throw new ModelOverloadError('openrouter', `Service temporarily unavailable: ${errorData.error?.message || 'Service overloaded'}`);
          default:
            if (response.status >= 500) {
              throw new AIServiceError('openrouter', `OpenRouter API error (${response.status}): ${errorData.error?.message || 'Unknown server error'}`, response.status);
            } else {
              throw new AIServiceError('openrouter', `OpenRouter API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`, response.status);
            }
        }
      }

      const responseData = await response.json();
      
      if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
        throw new ResponseParsingError('openrouter', 'Invalid response format from OpenRouter API');
      }

      const content = responseData.choices[0].message.content;
      this.logProviderInfo('Received response from OpenRouter API');
      return content;

    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout
      if (controller.signal.aborted) {
        throw new TimeoutError('openrouter', `Request timed out after ${this.timeout}ms`, this.timeout);
      }
      
      // Re-throw for generic handling
      throw error;
    }
  }

  /**
   * Makes a generic OpenRouter API request (used for health checks)
   */
  private async makeOpenRouterRequest(endpoint: string, body: any = {}, method: string = 'POST'): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.appName
      },
      ...(method !== 'GET' && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Parses and validates the OpenRouter response
   */
  private parseAndValidateResponse(responseText: string): ISolutionAnalysisResponse {
    try {
      this.logProviderInfo('Parsing AI response as JSON...');
      
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const analysisResult = JSON.parse(cleanedResponse) as ISolutionAnalysisResponse;
      
      // Use the base class validation method
      const validatedResult = this.validateAnalysisResponse(analysisResult);
      
      this.logProviderInfo('Successfully parsed and validated AI response');
      return validatedResult;
    } catch (parseError) {
      this.logProviderError('Failed to parse AI response as JSON:', parseError);
      this.logProviderError('Raw response (first 200 chars):', responseText.substring(0, 200));
      
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new ResponseParsingError('openrouter', `Failed to parse AI response: ${errorMessage}`, responseText);
    }
  }
}