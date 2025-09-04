/**
 * Demonstration script showing how to use both providers
 * This file is for educational purposes and testing provider switching
 */

import { SolutionAnalysisProviderFactory } from '../ProviderFactory';
import { ICrucibleProblem } from '../../../../models/crucibleProblem.model';

// Mock problem for demonstration
const demoProblem: Partial<ICrucibleProblem> = {
  title: 'FizzBuzz Implementation',
  description: 'Implement the classic FizzBuzz problem',
  expectedOutcome: 'Print numbers 1-100, replacing multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz"',
  difficulty: 'easy',
  tags: ['loops', 'conditionals', 'modulo'],
  requirements: {
    functional: [
      { requirement: 'Print numbers from 1 to 100', context: 'Basic loop iteration' },
      { requirement: 'Replace multiples of 3 with "Fizz"', context: 'Modulo operation check' },
      { requirement: 'Replace multiples of 5 with "Buzz"', context: 'Modulo operation check' },
      { requirement: 'Replace multiples of both 3 and 5 with "FizzBuzz"', context: 'Combined condition check' }
    ],
    nonFunctional: [
      { requirement: 'Code should be readable and efficient', context: 'Performance and maintainability' }
    ]
  },
  constraints: ['Use JavaScript', 'No external libraries']
};

const demoSolution = `
function fizzBuzz() {
  for (let i = 1; i <= 100; i++) {
    if (i % 15 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

fizzBuzz();
`;

/**
 * Demonstrates using the Gemini provider
 */
export async function demonstrateGeminiProvider() {
  console.log('🔹 Demonstrating Gemini Provider');
  
  try {
    const provider = SolutionAnalysisProviderFactory.getProvider('gemini');
    console.log(`Provider: ${provider.getProviderName()}`);
    console.log('Configuration:', provider.getConfiguration());
    
    // Check health
    const isHealthy = await provider.isHealthy();
    console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (isHealthy) {
      console.log('Running analysis...');
      const result = await provider.analyzeComprehensively(
        demoProblem as ICrucibleProblem,
        demoSolution,
        [],
        []
      );
      
      console.log(`Analysis completed - Score: ${result.overallScore}/100`);
      console.log(`AI Confidence: ${result.aiConfidence}%`);
    }
    
  } catch (error) {
    console.error('❌ Gemini Provider Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Demonstrates using the OpenRouter provider
 */
export async function demonstrateOpenRouterProvider() {
  console.log('🔸 Demonstrating OpenRouter Provider');
  
  try {
    const provider = SolutionAnalysisProviderFactory.getProvider('openrouter');
    console.log(`Provider: ${provider.getProviderName()}`);
    console.log('Configuration:', provider.getConfiguration());
    
    // Check health
    const isHealthy = await provider.isHealthy();
    console.log(`Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (isHealthy) {
      console.log('Running analysis...');
      const result = await provider.analyzeComprehensively(
        demoProblem as ICrucibleProblem,
        demoSolution,
        [],
        []
      );
      
      console.log(`Analysis completed - Score: ${result.overallScore}/100`);
      console.log(`AI Confidence: ${result.aiConfidence}%`);
    }
    
  } catch (error) {
    console.error('❌ OpenRouter Provider Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Demonstrates provider comparison
 */
export async function compareProviders() {
  console.log('🔄 Comparing Both Providers');
  
  try {
    // Get health status for all providers
    const healthStatus = await SolutionAnalysisProviderFactory.getAllProviderHealth();
    console.log('Provider Health Status:', healthStatus);
    
    // Get available providers
    const availableProviders = SolutionAnalysisProviderFactory.getAvailableProviders();
    console.log('Available Providers:', availableProviders);
    
    // Clear cache and test factory
    SolutionAnalysisProviderFactory.clearCache();
    console.log('Provider cache cleared');
    
    // Test primary provider selection
    const primaryProvider = SolutionAnalysisProviderFactory.getPrimaryProvider();
    console.log(`Primary Provider: ${primaryProvider.getProviderName()}`);
    
    // Test fallback provider
    const fallbackProvider = SolutionAnalysisProviderFactory.getFallbackProvider();
    console.log(`Fallback Provider: ${fallbackProvider.getProviderName()}`);
    
  } catch (error) {
    console.error('❌ Provider Comparison Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Main demonstration function
 */
export async function runProviderDemo() {
  console.log('🚀 Solution Analysis Provider Demonstration\n');
  
  await demonstrateGeminiProvider();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await demonstrateOpenRouterProvider();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await compareProviders();
  
  console.log('\n✅ Provider demonstration completed!');
}

// Export for use in tests or scripts
export {
  demoProblem,
  demoSolution
};

// Allow running as a script
if (require.main === module) {
  runProviderDemo().catch(console.error);
}