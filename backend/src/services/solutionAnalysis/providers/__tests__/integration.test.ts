import { generateComprehensiveAnalysis } from '../../../solutionAnalysis.service';
import { SolutionAnalysisProviderFactory } from '../ProviderFactory';
import { ICrucibleProblem } from '../../../../models/crucibleProblem.model';

describe('Solution Analysis Integration', () => {
  // Mock problem data for testing
  const mockProblem: Partial<ICrucibleProblem> = {
    title: 'Test Problem',
    description: 'A simple test problem for validation',
    expectedOutcome: 'Should implement a basic function',
    difficulty: 'easy',
    tags: ['javascript', 'function'],
    requirements: {
      functional: [{ requirement: 'Implement a function that returns hello world', context: 'Basic function implementation' }],
      nonFunctional: [{ requirement: 'Code should be readable', context: 'Code quality and maintainability' }]
    },
    constraints: ['Use JavaScript only']
  };

  const userSolution = `
function helloWorld() {
  return 'Hello, World!';
}
`;

  const ragDocuments: string[] = [];
  const technicalParameters: string[] = [];

  beforeEach(() => {
    // Clear provider cache before each test
    SolutionAnalysisProviderFactory.clearCache();
  });

  it('should maintain backward compatibility with existing service interface', async () => {
    // Skip if no API key is available
    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_PRO_API_KEY) {
      console.log('Skipping integration test - no Gemini API key available');
      return;
    }

    // This should work exactly as before the refactoring
    const result = await generateComprehensiveAnalysis(
      mockProblem as ICrucibleProblem,
      userSolution,
      ragDocuments,
      technicalParameters
    );

    // Verify the response structure hasn't changed
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('aiConfidence');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('evaluatedParameters');
    expect(result).toHaveProperty('feedback');
    
    expect(typeof result.overallScore).toBe('number');
    expect(typeof result.aiConfidence).toBe('number');
    expect(typeof result.summary).toBe('string');
    expect(Array.isArray(result.evaluatedParameters)).toBe(true);
    expect(typeof result.feedback).toBe('object');
    
    // Basic validation of feedback structure
    expect(result.feedback).toHaveProperty('strengths');
    expect(result.feedback).toHaveProperty('areasForImprovement');
    expect(result.feedback).toHaveProperty('suggestions');
    expect(Array.isArray(result.feedback.strengths)).toBe(true);
    expect(Array.isArray(result.feedback.areasForImprovement)).toBe(true);
    expect(Array.isArray(result.feedback.suggestions)).toBe(true);
  }, 30000); // 30 second timeout for API calls

  describe('Provider Interface Consistency', () => {
    it('should provide consistent interface for Gemini provider', async () => {
      // Skip if no API key is available
      if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_PRO_API_KEY) {
        console.log('Skipping Gemini provider test - no API key available');
        return;
      }

      const provider = SolutionAnalysisProviderFactory.getProvider('gemini');
      
      // Test provider interface methods
      expect(provider.getProviderName()).toBe('gemini');
      expect(typeof provider.isHealthy).toBe('function');
      expect(typeof provider.getConfiguration).toBe('function');
      expect(typeof provider.analyzeComprehensively).toBe('function');
      
      const config = provider.getConfiguration();
      expect(config.providerName).toBe('gemini');
    });

    it('should provide consistent interface for OpenRouter provider', async () => {
      // Skip if no API key is available
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('Skipping OpenRouter provider test - no API key available');
        return;
      }

      const provider = SolutionAnalysisProviderFactory.getProvider('openrouter');
      
      // Test provider interface methods
      expect(provider.getProviderName()).toBe('openrouter');
      expect(typeof provider.isHealthy).toBe('function');
      expect(typeof provider.getConfiguration).toBe('function');
      expect(typeof provider.analyzeComprehensively).toBe('function');
      
      const config = provider.getConfiguration();
      expect(config.providerName).toBe('openrouter');
    });

    it('should produce consistent response structure from both providers', async () => {
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

      // Test both providers with the same input
      const [geminiResult, openrouterResult] = await Promise.all([
        geminiProvider.analyzeComprehensively(
          mockProblem as ICrucibleProblem,
          userSolution,
          ragDocuments,
          technicalParameters
        ),
        openrouterProvider.analyzeComprehensively(
          mockProblem as ICrucibleProblem,
          userSolution,
          ragDocuments,
          technicalParameters
        )
      ]);

      // Both should have the same structure
      const validateStructure = (result: any) => {
        expect(result).toHaveProperty('overallScore');
        expect(result).toHaveProperty('aiConfidence');
        expect(result).toHaveProperty('summary');
        expect(result).toHaveProperty('evaluatedParameters');
        expect(result).toHaveProperty('feedback');
        expect(typeof result.overallScore).toBe('number');
        expect(typeof result.aiConfidence).toBe('number');
        expect(typeof result.summary).toBe('string');
        expect(Array.isArray(result.evaluatedParameters)).toBe(true);
        expect(Array.isArray(result.feedback.strengths)).toBe(true);
        expect(Array.isArray(result.feedback.areasForImprovement)).toBe(true);
        expect(Array.isArray(result.feedback.suggestions)).toBe(true);
      };

      validateStructure(geminiResult);
      validateStructure(openrouterResult);
      
      // Both scores should be reasonable (between 0 and 100)
      expect(geminiResult.overallScore).toBeGreaterThanOrEqual(0);
      expect(geminiResult.overallScore).toBeLessThanOrEqual(100);
      expect(openrouterResult.overallScore).toBeGreaterThanOrEqual(0);
      expect(openrouterResult.overallScore).toBeLessThanOrEqual(100);
    }, 60000); // 60 second timeout for both API calls
  });
});