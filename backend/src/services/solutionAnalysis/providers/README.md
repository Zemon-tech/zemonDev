# Solution Analysis Providers

This directory contains the provider implementation for the solution analysis system, supporting multiple AI providers (Gemini and OpenRouter) through a common interface.

## Architecture Overview

```
solutionAnalysis.service.ts
       ↓
ProviderFactory
       ↓
SolutionAnalysisProvider (interface)
       ↓
├── GeminiSolutionAnalysisProvider
└── OpenRouterSolutionAnalysisProvider
       ↓
BaseSolutionAnalysisProvider (shared functionality)
```

## Files Structure

### Core Files
- **`SolutionAnalysisProvider.interface.ts`** - Provider contract interface
- **`BaseSolutionAnalysisProvider.ts`** - Abstract base class with shared functionality
- **`ProviderFactory.ts`** - Factory for creating and managing provider instances
- **`ProviderErrors.ts`** - Comprehensive error type system
- **`index.ts`** - Barrel exports for easy imports

### Provider Implementations
- **`GeminiSolutionAnalysisProvider.ts`** - Gemini 2.5 Flash implementation
- **`OpenRouterSolutionAnalysisProvider.ts`** - OpenRouter (Claude 3.5 Sonnet) implementation

### Tests
- **`__tests__/GeminiProvider.test.ts`** - Gemini provider unit tests
- **`__tests__/OpenRouterProvider.test.ts`** - OpenRouter provider unit tests
- **`__tests__/integration.test.ts`** - Cross-provider integration tests
- **`__tests__/provider-demo.ts`** - Demonstration script

## Configuration

### Environment Variables

```bash
# Solution Analysis Provider Configuration
SOLUTION_ANALYSIS_PROVIDER=gemini           # 'openrouter' | 'gemini'
OPENROUTER_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet
ENABLE_ANALYSIS_FALLBACK=true              # Enable automatic fallback
ANALYSIS_PROVIDER_TIMEOUT=30000            # Timeout in milliseconds

# Provider API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_PRO_API_KEY=your_gemini_pro_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Switching Providers

To switch from Gemini to OpenRouter:
```bash
# Change in your .env file
SOLUTION_ANALYSIS_PROVIDER=openrouter
```

No code changes required - the system will automatically use the new provider.

## Usage Examples

### Basic Usage (Current Service)
```typescript
import { generateComprehensiveAnalysis } from '../solutionAnalysis.service';

// This works exactly as before - no changes needed
const result = await generateComprehensiveAnalysis(
  problemDetails,
  userSolution,
  ragDocuments,
  technicalParameters
);
```

### Direct Provider Usage
```typescript
import { SolutionAnalysisProviderFactory } from './providers/ProviderFactory';

// Get the configured provider
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();

// Use the provider directly
const result = await provider.analyzeComprehensively(
  problemDetails,
  userSolution,
  ragDocuments,
  technicalParameters
);
```

### Provider-Specific Usage
```typescript
import { SolutionAnalysisProviderFactory } from './providers/ProviderFactory';

// Force use of specific provider
const geminiProvider = SolutionAnalysisProviderFactory.getProvider('gemini');
const openrouterProvider = SolutionAnalysisProviderFactory.getProvider('openrouter');

// Check provider health
const isHealthy = await provider.isHealthy();

// Get provider configuration
const config = provider.getConfiguration();
```

## Provider Comparison

| Feature | Gemini 2.5 Flash | OpenRouter (Claude 3.5 Sonnet) |
|---------|------------------|--------------------------------|
| **Model** | gemini-2.5-flash | anthropic/claude-3.5-sonnet |
| **Response Time** | ~5-15 seconds | ~10-20 seconds |
| **Cost** | Lower | Higher |
| **Analysis Quality** | High | Very High |
| **JSON Reliability** | Good | Excellent |
| **Rate Limits** | Generous | Moderate |
| **Availability** | High | High |

## Error Handling

The provider system includes comprehensive error handling:

### Error Types
- **`ModelOverloadError`** - Model is overloaded or rate-limited
- **`ResponseParsingError`** - Failed to parse AI response
- **`AIServiceError`** - General AI service error
- **`AuthenticationError`** - Invalid API credentials
- **`TimeoutError`** - Request timeout
- **`ConfigurationError`** - Invalid provider configuration

### Error Mapping
All provider-specific errors are mapped to legacy error types for backward compatibility:
```typescript
// New provider errors are automatically mapped to:
// - GeminiModelOverloadError
// - GeminiParsingError  
// - GeminiServiceError
```

## Testing

### Running Tests
```bash
# Run all provider tests
npm test -- providers

# Run specific provider tests
npm test -- GeminiProvider.test.ts
npm test -- OpenRouterProvider.test.ts

# Run integration tests
npm test -- integration.test.ts
```

### Demo Script
```bash
# Run the provider demonstration
npx ts-node src/services/solutionAnalysis/providers/__tests__/provider-demo.ts
```

## Provider Health Monitoring

```typescript
import { SolutionAnalysisProviderFactory } from './providers/ProviderFactory';

// Check all provider health status
const healthStatus = await SolutionAnalysisProviderFactory.getAllProviderHealth();
console.log(healthStatus);
// Output: { gemini: true, openrouter: true }

// Check available providers
const available = SolutionAnalysisProviderFactory.getAvailableProviders();
console.log(available); // ['gemini', 'openrouter']
```

## Backward Compatibility

The provider system maintains 100% backward compatibility:
- All existing code continues to work unchanged
- Same function signatures and response formats
- Legacy error types preserved
- No breaking changes to the API

## Future Extensions

To add a new provider (e.g., "anthropic"):

1. **Create provider implementation**:
   ```typescript
   export class AnthropicSolutionAnalysisProvider extends BaseSolutionAnalysisProvider {
     // Implement required methods
   }
   ```

2. **Update factory**:
   ```typescript
   case 'anthropic':
     provider = new AnthropicSolutionAnalysisProvider();
     break;
   ```

3. **Update configuration**:
   - Add to environment variables
   - Update AI config interface
   - Add validation rules

4. **Add tests**:
   - Unit tests for the new provider
   - Integration tests
   - Update demo script

## Performance Considerations

- **Provider Caching**: Providers are cached by the factory for efficiency
- **Retry Logic**: Built-in retry with exponential backoff for transient failures
- **Timeout Handling**: Configurable timeouts prevent hanging requests
- **Health Checks**: Regular health monitoring for proactive issue detection

## Troubleshooting

### Common Issues

1. **Provider not found error**:
   - Check `SOLUTION_ANALYSIS_PROVIDER` environment variable
   - Ensure provider is in available providers list

2. **API key errors**:
   - Verify API keys are set correctly
   - Check key format and validity

3. **Timeout errors**:
   - Increase `ANALYSIS_PROVIDER_TIMEOUT` value
   - Check network connectivity

4. **Response parsing errors**:
   - Usually indicates model output format issues
   - Check model configuration and prompts

### Debug Logging

Enable debug logging to troubleshoot issues:
```typescript
// Provider factory logs provider creation
// Individual providers log request/response details
// Error mapping provides detailed error context
```

## Contributing

When contributing to the provider system:

1. Follow the existing patterns and interfaces
2. Add comprehensive tests for new functionality
3. Update documentation and examples
4. Ensure backward compatibility
5. Test with both providers to ensure consistency