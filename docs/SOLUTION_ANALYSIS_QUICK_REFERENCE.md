# Solution Analysis Provider - Quick Reference

## Quick Setup

### 1. Environment Configuration

#### Gemini Only (Default)
```bash
ANALYSIS_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

#### OpenRouter Only
```bash
ANALYSIS_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

#### OpenRouter with Gemini Fallback (Recommended)
```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
```

### 2. API Usage (No Code Changes Required)

```typescript
import { generateComprehensiveAnalysis } from '../services/solutionAnalysis.service';

const result = await generateComprehensiveAnalysis(
  problemDetails,
  userSolution,
  ragDocuments,
  technicalParameters
);
```

## Common Commands

### Get Provider Information
```typescript
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
console.log('Provider:', provider.getProviderName());
console.log('Healthy:', await provider.isHealthy());
```

### Access Specific Provider
```typescript
// Raw providers (no fallback)
const gemini = SolutionAnalysisProviderFactory.getRawProvider('gemini');
const openrouter = SolutionAnalysisProviderFactory.getRawProvider('openrouter');

// Fallback provider
const fallback = SolutionAnalysisProviderFactory.getFallbackProvider();
```

### Check Metrics (Fallback Provider)
```typescript
if (provider instanceof FallbackSolutionAnalysisProvider) {
  const metrics = provider.getMetrics();
  console.log('Metrics:', metrics);
}
```

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ANALYSIS_PROVIDER` | Yes | Primary provider (`gemini` \| `openrouter`) | `gemini` |
| `ENABLE_ANALYSIS_FALLBACK` | No | Enable fallback strategy | `false` |
| `ANALYSIS_FALLBACK_PROVIDER` | No* | Fallback provider name | `gemini` |
| `ANALYSIS_PROVIDER_TIMEOUT` | No | Request timeout (ms) | `30000` |
| `GEMINI_API_KEY` | No* | Gemini API key | - |
| `GEMINI_MODEL` | No | Gemini model name | `gemini-2.5-flash` |
| `OPENROUTER_API_KEY` | No* | OpenRouter API key | - |
| `OPENROUTER_ANALYSIS_MODEL` | No | OpenRouter model | `anthropic/claude-3.5-sonnet` |

*Required when using the respective provider

## Error Types

```typescript
// New provider errors
ModelOverloadError          // 503, 429 errors (retryable)
ResponseParsingError        // JSON parsing failed
AIServiceError             // General service errors
AuthenticationError        // 401, 403 errors (not retryable)
TimeoutError              // Request timeout
ConfigurationError        // Missing API keys, invalid config

// Legacy errors (deprecated but supported)
AIModelOverloadError      // Mapped from ModelOverloadError
AIParsingError           // Mapped from ResponseParsingError
AIServiceError           // Mapped from AIServiceError
```

## Troubleshooting

### OpenRouter 404 Error
```bash
# Check model name
OPENROUTER_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet

# For free tier
OPENROUTER_ANALYSIS_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

### Authentication Errors
```bash
# Verify API keys
echo $OPENROUTER_API_KEY  # Should start with "or-v1-"
echo $GEMINI_API_KEY      # Should start with "AIza"
```

### Fallback Not Working
```bash
# Check configuration
ENABLE_ANALYSIS_FALLBACK=true           # Must be exactly "true"
ANALYSIS_FALLBACK_PROVIDER=gemini       # Must differ from primary
```

### Debug Mode
```bash
DEBUG=solution-analysis:* npm start
```

## Model Recommendations

### OpenRouter Models

#### Production (Paid)
- `anthropic/claude-3.5-sonnet` - **Recommended** (high quality)
- `openai/gpt-4o` - Good alternative
- `openai/gpt-4-turbo` - Cost-effective option

#### Development/Testing (Free)
- `meta-llama/llama-3.1-8b-instruct:free`
- `google/gemma-2-9b-it:free`
- `openai/gpt-4o-mini`

### Gemini Models
- `gemini-2.5-flash` - **Default** (free, fast)
- `gemini-1.5-pro` - Higher quality (paid)

## Performance Tips

1. **Use fallback for production**: `ENABLE_ANALYSIS_FALLBACK=true`
2. **Monitor response times**: Check metrics regularly
3. **Set appropriate timeouts**: Default 30s usually sufficient
4. **Cache providers**: Automatic - no action needed
5. **Health checks**: Use `isHealthy()` for monitoring

## Migration Checklist

- [ ] API keys configured for chosen providers
- [ ] Environment variables set correctly
- [ ] Fallback strategy configured (production)
- [ ] Monitoring/logging in place
- [ ] Error handling updated (if needed)
- [ ] Testing completed
- [ ] Documentation updated

## Support

- **Main Documentation**: `SOLUTION_ANALYSIS_PROVIDER_MIGRATION_GUIDE.md`
- **Implementation Details**: `SOLUTION_ANALYSIS_PROVIDER_MIGRATION_PLAN.md`
- **Test Suite**: `backend/src/services/solutionAnalysis/providers/__tests__/`