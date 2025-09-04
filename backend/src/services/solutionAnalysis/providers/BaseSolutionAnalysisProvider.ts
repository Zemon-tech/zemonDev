import { ICrucibleProblem } from '../../../models/crucibleProblem.model';
import { ISolutionAnalysisResponse } from '../../solutionAnalysis.service';
import { SolutionAnalysisProvider } from './SolutionAnalysisProvider.interface';

/**
 * Abstract base class for solution analysis providers
 * Contains shared functionality and utilities used by all provider implementations
 */
export abstract class BaseSolutionAnalysisProvider implements SolutionAnalysisProvider {
  protected readonly MAX_ATTEMPTS = 2;
  protected readonly RETRY_DELAY_BASE = 300; // milliseconds

  /**
   * Abstract method that must be implemented by concrete providers
   */
  abstract analyzeComprehensively(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): Promise<ISolutionAnalysisResponse>;

  /**
   * Abstract method to get provider name
   */
  abstract getProviderName(): string;

  /**
   * Abstract method to check provider health
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * Abstract method to get provider configuration
   */
  abstract getConfiguration(): {
    providerName: string;
    model?: string;
    timeout?: number;
    [key: string]: any;
  };

  /**
   * Builds the comprehensive analysis prompt used by all providers
   * This ensures consistent prompt structure across different AI providers
   */
  protected buildAnalysisPrompt(
    problemDetails: ICrucibleProblem,
    userSolution: string,
    ragDocuments: string[],
    technicalParameters: string[]
  ): string {
    // Log information about the inputs
    console.log(`[${this.getProviderName()}] Generating analysis for problem: ${problemDetails.title}`);
    console.log(`[${this.getProviderName()}] User solution length: ${userSolution.length} characters`);
    console.log(`[${this.getProviderName()}] RAG documents: ${ragDocuments.length} documents retrieved`);
    console.log(`[${this.getProviderName()}] Technical parameters: ${technicalParameters.length} parameters to evaluate`);

    return `
You are a world-class AI system architect and a neutral evaluator. Perform a blind, evidence-based review of the user's solution for the given programming problem. Optimize for fairness and objectivity.

## PROBLEM DETAILS ##
Title: ${problemDetails.title}
Description: ${problemDetails.description}
Expected Outcome: ${problemDetails.expectedOutcome}
Difficulty: ${problemDetails.difficulty}
Tags: ${problemDetails.tags.join(', ')}
Functional Requirements: ${problemDetails.requirements.functional.map(req => req.requirement).join('\n')}
Non-Functional Requirements: ${problemDetails.requirements.nonFunctional.map(req => req.requirement).join('\n')}
Constraints: ${problemDetails.constraints.join('\n')}

## TECHNICAL & ARCHITECTURAL PARAMETERS TO EVALUATE ##
${technicalParameters.length > 0 
  ? technicalParameters.join('\n') 
  : `
- Code Quality: Evaluate the overall code quality, readability, and maintainability
- Performance: Assess the solution's performance characteristics and efficiency
- Correctness: Determine if the solution correctly addresses all requirements
- Design: Evaluate the architectural design and structure of the solution
- Error Handling: Assess how well the solution handles edge cases and errors
`}

## RELEVANT KNOWLEDGE BASE DOCUMENTS (FOR CONTEXT) ##
${ragDocuments.length > 0 
  ? ragDocuments.join('\n\n---\n\n') 
  : "No additional context documents are available. Evaluate strictly based on the problem details and solution provided."}

## USER'S SUBMITTED SOLUTION ##
${userSolution}

## FAIRNESS AND OBJECTIVITY POLICY ##
- No stylistic or technology bias: Do not favor any specific language, framework, or paradigm. Judge only against stated requirements, general engineering principles, and evidence present in the solution.
- Evidence-based reasoning: When deducting points, base the deduction on concrete observations in the solution or explicit requirements/constraints. Avoid assumptions beyond the provided context.
- Handle unknowns neutrally: If information is missing or ambiguous, mark it as "Insufficient evidence" in justifications and do not penalize. Reflect uncertainty in aiConfidence instead.
- Give partial credit: Award points for correctly handled portions even if the solution is incomplete.
- Respect trade-offs: If the solution makes a reasonable trade-off (e.g., clarity over micro-optimizations) that fits the constraints, do not penalize.
- Unconventional but valid: Do not penalize novel approaches if they satisfy the requirements and constraints.

## SCORING RUBRIC (ANCHORS) ##
- 90–100: Exceptional – Thorough, correct, robust, and well-justified relative to requirements and constraints.
- 75–89: Solid – Correct with minor issues or reasonable trade-offs; generally production-ready with small improvements.
- 60–74: Adequate – Meets core requirements with notable gaps; needs meaningful fixes before production.
- 40–59: Partial – Addresses some requirements but with major issues or omissions.
- 0–39: Poor – Largely incorrect, unsafe, or fails to meet core requirements.

## ANALYSIS INSTRUCTIONS ##
- Tie each parameter's justification to specific evidence: reference the requirement, constraint, or a brief snippet/paraphrase (≤200 characters) from the user's solution.
- If a parameter cannot be assessed due to missing information, state "Insufficient evidence" and avoid penalization for that unknown.
- Consider problem difficulty and constraints when judging complexity, performance, and design choices.
- Suggestions must be specific and actionable within the problem context; avoid prescribing a particular stack unless required by constraints.
- Keep the tone professional and constructive.

## OUTPUT SCHEMA ##
\`\`\`typescript
interface IAnalysisParameter {
  name: string;
  score: number; // Score out of 100 (integers preferred)
  justification: string; // Reasoning tied to explicit evidence or "Insufficient evidence"
}

interface ISolutionAnalysisResult {
  overallScore: number; // Overall score out of 100 (reflecting rubric anchors)
  aiConfidence: number; // 0–100, lower when evidence is sparse or ambiguous
  summary: string; // Concise summary (max 180–250 words)
  evaluatedParameters: IAnalysisParameter[]; // Cover each provided parameter (deduplicate by name if needed)
  feedback: {
    strengths: string[]; // 2–5 key strengths grounded in evidence
    areasForImprovement: string[]; // 2–5 improvement areas grounded in evidence
    suggestions: string[]; // 2–5 actionable, context-aware suggestions
  };
}
\`\`\`

## OUTPUT REQUIREMENTS ##
- Return a single valid JSON object only (no backticks, no extra text).
- Ensure numeric fields are numbers, not strings.
- Keep justifications concise and evidence-based.
`;
  }

  /**
   * Validates that the analysis response has all required fields
   * @param response - The parsed analysis response to validate
   * @returns true if valid, throws error if invalid
   */
  protected validateAnalysisResponse(response: any): ISolutionAnalysisResponse {
    if (!response || typeof response !== 'object') {
      throw new Error('Analysis response is not a valid object');
    }

    // Check required fields
    const requiredFields = ['overallScore', 'aiConfidence', 'summary', 'evaluatedParameters', 'feedback'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate field types and ranges
    if (typeof response.overallScore !== 'number' || response.overallScore < 0 || response.overallScore > 100) {
      throw new Error('overallScore must be a number between 0 and 100');
    }

    if (typeof response.aiConfidence !== 'number' || response.aiConfidence < 0 || response.aiConfidence > 100) {
      throw new Error('aiConfidence must be a number between 0 and 100');
    }

    if (typeof response.summary !== 'string' || response.summary.length === 0) {
      throw new Error('summary must be a non-empty string');
    }

    if (!Array.isArray(response.evaluatedParameters)) {
      throw new Error('evaluatedParameters must be an array');
    }

    if (!response.feedback || typeof response.feedback !== 'object') {
      throw new Error('feedback must be an object');
    }

    const feedbackRequiredFields = ['strengths', 'areasForImprovement', 'suggestions'];
    for (const field of feedbackRequiredFields) {
      if (!Array.isArray(response.feedback[field])) {
        throw new Error(`feedback.${field} must be an array`);
      }
    }

    return response as ISolutionAnalysisResponse;
  }

  /**
   * Implements retry logic for API calls with exponential backoff
   * @param operation - The operation to retry
   * @param operationName - Name for logging purposes
   * @returns The result of the successful operation
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`[${this.getProviderName()}] ${operationName} attempt ${attempt}/${this.MAX_ATTEMPTS}`);
        const result = await operation();
        console.log(`[${this.getProviderName()}] ${operationName} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        const maybeError = error as { status?: number; message?: string };
        
        // Check if error is worth retrying (5xx errors)
        const isTransient = (maybeError?.status && maybeError.status >= 500) ||
          (typeof maybeError?.message === 'string' && /Internal Server Error|5\d\d/.test(maybeError.message));
        
        if (attempt < this.MAX_ATTEMPTS && isTransient) {
          const backoffMs = this.RETRY_DELAY_BASE * attempt;
          console.warn(`[${this.getProviderName()}] ${operationName} failed (transient). Retrying in ${backoffMs}ms...`, maybeError);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        
        console.error(`[${this.getProviderName()}] ${operationName} failed on attempt ${attempt}:`, error);
        break;
      }
    }

    throw lastError!;
  }

  /**
   * Logs provider-specific information for debugging
   */
  protected logProviderInfo(message: string, data?: any): void {
    console.log(`[${this.getProviderName()}] ${message}`, data || '');
  }

  /**
   * Logs provider-specific warnings
   */
  protected logProviderWarning(message: string, data?: any): void {
    console.warn(`[${this.getProviderName()}] ${message}`, data || '');
  }

  /**
   * Logs provider-specific errors
   */
  protected logProviderError(message: string, error?: any): void {
    console.error(`[${this.getProviderName()}] ${message}`, error || '');
  }
}