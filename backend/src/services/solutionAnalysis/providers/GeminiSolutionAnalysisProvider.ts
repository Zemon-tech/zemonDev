import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ICrucibleProblem } from '../../../models/crucibleProblem.model';
import { BaseSolutionAnalysisProvider } from './BaseSolutionAnalysisProvider';
import { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';
import { 
  ModelOverloadError, 
  ResponseParsingError, 
  AIServiceError, 
  AuthenticationError,
  ConfigurationError,
  mapToProviderError
} from './ProviderErrors';
import env from '../../../config/env';

/**
 * Gemini implementation of the solution analysis provider
 * Uses Google's Gemini 2.5 Flash model for comprehensive solution analysis
 */
export class GeminiSolutionAnalysisProvider extends BaseSolutionAnalysisProvider {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: string;
  private readonly timeout: number;

  constructor() {
    super();
    
    // Initialize with environment configuration
    const apiKey = env.GEMINI_PRO_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ConfigurationError('gemini', 'GEMINI_PRO_API_KEY or GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.timeout = env.ANALYSIS_PROVIDER_TIMEOUT || 30000;
    
    this.logProviderInfo('Initialized with model:', this.model);
  }

  /**
   * Performs comprehensive analysis using Gemini 2.5 Flash model
   */
  async analyzeComprehensively(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): Promise<ISolutionAnalysisResponse> {
    this.logProviderInfo('Starting comprehensive analysis');

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      // Build the analysis prompt using the shared base class method
      const prompt = this.buildAnalysisPrompt(problemDetails, userSolution, ragDocuments, technicalParameters);

      // Execute analysis with retry logic
      const responseText = await this.retryWithBackoff(
        async () => this.callGeminiAPI(model, prompt),
        'Gemini API call'
      );

      if (!responseText) {
        throw new AIServiceError('gemini', 'Empty response from Gemini after retries.');
      }

      // Parse and validate the response
      const analysisResult = this.parseAndValidateResponse(responseText);
      
      this.logProviderInfo('Analysis completed successfully');
      return analysisResult;

    } catch (error) {
      this.logProviderError('Analysis failed:', error);
      
      // Map to appropriate provider error
      throw mapToProviderError(error, 'gemini');
    }
  }

  /**
   * Returns the provider name
   */
  getProviderName(): string {
    return 'gemini';
  }

  /**
   * Checks if the Gemini provider is healthy and ready
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check by making a minimal API call
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent('Test health check');
      return Boolean(result.response.text());
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
      maxRetries: this.MAX_ATTEMPTS,
      retryDelayBase: this.RETRY_DELAY_BASE
    };
  }

  /**
   * Calls the Gemini API with timeout handling
   */
  private async callGeminiAPI(model: any, prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const result = await model.generateContent(prompt);
      clearTimeout(timeoutId);
      
      const responseText = result.response.text();
      this.logProviderInfo('Received response from Gemini');
      return responseText;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific Gemini error types
      const errorObj = error as any;
      
      if (controller.signal.aborted) {
        throw new Error(`Request timed out after ${this.timeout}ms`);
      }
      
      if (errorObj?.status === 503 || errorObj?.message?.includes('overloaded')) {
        throw new ModelOverloadError('gemini', 'The AI model is currently overloaded. Please try again later.');
      }
      
      if (errorObj?.status === 429 || errorObj?.message?.includes('rate limit')) {
        throw new ModelOverloadError('gemini', 'Rate limit exceeded. Please try again later.');
      }
      
      if (errorObj?.status === 401 || errorObj?.status === 403) {
        throw new AuthenticationError('gemini', 'Invalid API key or insufficient permissions.');
      }
      
      if (errorObj?.status && errorObj.status >= 500) {
        throw new AIServiceError('gemini', `Gemini service error (${errorObj.status}): ${errorObj.statusText || 'Unknown error'}`, errorObj.status);
      }
      
      // Re-throw for generic handling
      throw error;
    }
  }

  /**
   * Parses and validates the Gemini response
   */
  private parseAndValidateResponse(responseText: string): ISolutionAnalysisResponse {
    try {
      this.logProviderInfo('Parsing AI response as JSON...');
      const analysisResult = JSON.parse(responseText) as ISolutionAnalysisResponse;
      
      // Use the base class validation method
      const validatedResult = this.validateAnalysisResponse(analysisResult);
      
      this.logProviderInfo('Successfully parsed and validated AI response');
      return validatedResult;
    } catch (parseError) {
      this.logProviderError('Failed to parse AI response as JSON:', parseError);
      this.logProviderError('Raw response (first 200 chars):', responseText.substring(0, 200));
      
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new ResponseParsingError('gemini', `Failed to parse AI response: ${errorMessage}`, responseText);
    }
  }
}