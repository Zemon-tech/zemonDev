# Solution Analysis Provider Migration Guide

## Overview

This guide provides comprehensive documentation for the Solution Analysis Provider Migration implementation, which enables seamless switching between AI providers (Gemini and OpenRouter) with automatic fallback capabilities. The migration maintains full backward compatibility while providing enhanced reliability and flexibility.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration Guide](#configuration-guide)
3. [Provider Selection](#provider-selection)
4. [Fallback Strategy](#fallback-strategy)
5. [API Usage](#api-usage)
6. [Error Handling](#error-handling)
7. [Monitoring and Metrics](#monitoring-and-metrics)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Architecture Overview

### Provider Pattern Implementation

The solution analysis system implements a **provider pattern architecture** that abstracts AI provider implementations behind a common interface. This allows seamless switching between different AI providers without changing application code.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Solution Analysis Service                    │
├─────────────────────────────────────────────────────────────────┤
│                     Provider Factory                           │
├─────────────────────────────────────────────────────────────────┤
│              Fallback Provider (Optional)                      │
├─────────────────────────────────────────────────────────────────┤
│  Gemini Provider          │          OpenRouter Provider       │
│  ┌─────────────────────┐  │  ┌─────────────────────────────────┐ │
│  │ Google Gemini API   │  │  │ OpenRouter API                  │ │
│  │ (Gemini 2.5 Flash)  │  │  │ (Claude 3.5 Sonnet)            │ │
│  └─────────────────────┘  │  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Provider Interface
- **File**: `backend/src/services/solutionAnalysis/providers/SolutionAnalysisProvider.interface.ts`
- **Purpose**: Defines the contract that all providers must implement
- **Methods**:
  - `analyzeComprehensively()` - Main analysis method
  - `getProviderName()` - Returns provider identifier
  - `isHealthy()` - Health check method
  - `getConfiguration()` - Returns provider configuration

#### 2. Base Provider Class
- **File**: `backend/src/services/solutionAnalysis/providers/BaseSolutionAnalysisProvider.ts`
- **Purpose**: Provides shared functionality for all providers
- **Features**:
  - Common prompt building logic
  - Retry mechanism with exponential backoff
  - Response validation
  - Logging utilities

#### 3. Concrete Providers
- **Gemini Provider**: `GeminiSolutionAnalysisProvider.ts`
- **OpenRouter Provider**: `OpenRouterSolutionAnalysisProvider.ts`
- **Fallback Provider**: `FallbackSolutionAnalysisProvider.ts`

#### 4. Provider Factory
- **File**: `backend/src/services/solutionAnalysis/providers/ProviderFactory.ts`
- **Purpose**: Creates and manages provider instances
- **Features**:
  - Configuration-based provider selection
  - Provider caching
  - Fallback provider wrapping

---

## Configuration Guide

### Environment Variables

#### Core Configuration
```bash
# Primary provider selection (required)
ANALYSIS_PROVIDER=openrouter  # Options: 'gemini' | 'openrouter'

# Fallback configuration (optional)
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini

# Provider timeouts (optional)
ANALYSIS_PROVIDER_TIMEOUT=30000  # 30 seconds
```

#### Provider-Specific Configuration

##### Gemini Configuration
```bash
# API Key (required for Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
# OR
GEMINI_PRO_API_KEY=your_gemini_pro_api_key_here

# Model selection (optional)
GEMINI_MODEL=gemini-2.5-flash  # Default model
```

##### OpenRouter Configuration
```bash
# API Key (required for OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Model selection (optional)
OPENROUTER_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet  # Default model

# Application identification (recommended)
OPENROUTER_APP_NAME=ZemonDev-Crucible
OPENROUTER_SITE_URL=https://zemondev.com
```

### Configuration File Updates

#### 1. Update `.env.example`
```bash
# Solution Analysis Provider Configuration
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=false
ANALYSIS_FALLBACK_PROVIDER=gemini
ANALYSIS_PROVIDER_TIMEOUT=30000

# Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# OpenRouter Configuration  
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_APP_NAME=ZemonDev-Crucible
OPENROUTER_SITE_URL=https://zemondev.com
```

#### 2. Environment Validation
The system includes comprehensive environment validation:
- **Missing API Keys**: Clear error messages for missing required keys
- **Invalid Providers**: Warnings for unsupported provider names
- **Configuration Mismatches**: Alerts when fallback provider equals primary provider

---

## Provider Selection

### Automatic Provider Selection

The system automatically selects providers based on environment configuration:

```typescript
// Primary provider selection
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();

// The factory returns:
// - Raw provider when ENABLE_ANALYSIS_FALLBACK=false
// - Fallback-wrapped provider when ENABLE_ANALYSIS_FALLBACK=true
```

### Manual Provider Access

For specific use cases, you can access providers directly:

```typescript
// Get specific provider without fallback
const geminiProvider = SolutionAnalysisProviderFactory.getRawProvider('gemini');
const openrouterProvider = SolutionAnalysisProviderFactory.getRawProvider('openrouter');

// Get fallback provider
const fallbackProvider = SolutionAnalysisProviderFactory.getFallbackProvider();
```

### Configuration Scenarios

#### Scenario 1: Gemini Only (Default)
```bash
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=false
GEMINI_API_KEY=your_key_here
```
**Result**: Direct Gemini provider usage

#### Scenario 2: OpenRouter Only
```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=false
OPENROUTER_API_KEY=your_key_here
```
**Result**: Direct OpenRouter provider usage

#### Scenario 3: OpenRouter with Gemini Fallback (Recommended)
```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
```
**Result**: OpenRouter with automatic Gemini fallback

---

## Fallback Strategy

### When Fallback is Triggered

The fallback strategy activates automatically for **retryable errors**:

#### Retryable Error Types
1. **Model Overload Errors** (503, 429 HTTP status codes)
2. **Network Connectivity Issues**
   - Connection timeouts
   - Connection resets (ECONNRESET)
   - DNS resolution failures (ENOTFOUND)
3. **Server Errors** (5xx HTTP status codes)
4. **Provider-Specific Retryable Errors**

#### Non-Retryable Errors (No Fallback)
1. **Authentication Errors** (401, 403 HTTP status codes)
2. **Configuration Errors** (missing API keys, invalid models)
3. **Request Format Errors** (400 HTTP status codes)
4. **Rate Limiting** (when explicitly configured as non-retryable)

### Fallback Flow

```
1. Primary Provider Attempt
   ├─ Success → Return Result
   └─ Failure
       ├─ Is Error Retryable?
       │   ├─ Yes → Attempt Fallback Provider
       │   │   ├─ Success → Return Result + Log Fallback
       │   │   └─ Failure → Throw Primary Error
       │   └─ No → Throw Primary Error Immediately
```

### Fallback Configuration Examples

#### High Availability Setup
```bash
# Primary: OpenRouter (higher quality)
# Fallback: Gemini (reliable backup)
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
```

#### Cost Optimization Setup
```bash
# Primary: Gemini (free tier)
# Fallback: OpenRouter (paid, higher quality)
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=openrouter
```

---

## API Usage

### Main Service Function

The migration maintains complete backward compatibility:

```typescript
import { generateComprehensiveAnalysis } from '../services/solutionAnalysis.service';

// Usage remains exactly the same
const result = await generateComprehensiveAnalysis(
  problemDetails,
  userSolution,
  ragDocuments,
  technicalParameters
);
```

### Response Structure

All providers return the same standardized response structure:

```typescript
interface ISolutionAnalysisResponse {
  overallScore: number;        // 0-100
  aiConfidence: number;        // 0-100
  summary: string;
  evaluatedParameters: IAnalysisParameter[];
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
    suggestions: string[];
  };
}

interface IAnalysisParameter {
  name: string;
  score: number;              // 0-100
  justification: string;
}
```

### Provider Information

Access provider information for monitoring:

```typescript
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();

// Get provider name
const name = provider.getProviderName();
// Examples: "gemini", "openrouter", "openrouter-with-gemini-fallback"

// Check health status
const isHealthy = await provider.isHealthy();

// Get configuration (no sensitive data)
const config = provider.getConfiguration();
```

---

## Error Handling

### Error Types

The system provides specific error types for different failure scenarios:

```typescript
// Provider-specific errors
class SolutionAnalysisProviderError extends Error {
  constructor(
    public provider: string,
    message: string,
    public originalError?: unknown
  ) { super(message); }
}

class ModelOverloadError extends SolutionAnalysisProviderError {}
class ResponseParsingError extends SolutionAnalysisProviderError {}
class AIServiceError extends SolutionAnalysisProviderError {}
class AuthenticationError extends SolutionAnalysisProviderError {}
class TimeoutError extends SolutionAnalysisProviderError {}
class ConfigurationError extends SolutionAnalysisProviderError {}
```

### Error Mapping

For backward compatibility, provider errors are mapped to legacy error types:

```typescript
// Legacy error types (deprecated but maintained)
export class AIModelOverloadError extends Error {}
export class AIParsingError extends Error {}
export class AIServiceError extends Error {}
```

### Error Handling Best Practices

```typescript
try {
  const result = await generateComprehensiveAnalysis(
    problemDetails,
    userSolution,
    ragDocuments,
    technicalParameters
  );
  return result;
} catch (error) {
  if (error instanceof ModelOverloadError) {
    // Handle model overload (retry later)
    console.log('Model overloaded, try again later');
  } else if (error instanceof AuthenticationError) {
    // Handle authentication issue (check API keys)
    console.log('Authentication failed, check API keys');
  } else if (error instanceof ConfigurationError) {
    // Handle configuration issue
    console.log('Configuration error:', error.message);
  } else {
    // Handle other errors
    console.log('Analysis failed:', error.message);
  }
  throw error;
}
```

---

## Monitoring and Metrics

### Fallback Provider Metrics

When using fallback providers, comprehensive metrics are tracked:

```typescript
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
if (provider instanceof FallbackSolutionAnalysisProvider) {
  const metrics = provider.getMetrics();
  
  // Metrics per provider:
  // {
  //   "openrouter": {
  //     successCount: 45,
  //     failureCount: 3,
  //     fallbackCount: 0,
  //     averageResponseTime: 2300,
  //     lastSuccess: "2025-01-04T10:30:00Z",
  //     lastFailure: "2025-01-04T09:15:00Z"
  //   },
  //   "gemini": {
  //     successCount: 3,
  //     failureCount: 0,
  //     fallbackCount: 3,
  //     averageResponseTime: 1800
  //   }
  // }
}
```

### Logging

The system provides comprehensive logging for monitoring:

```bash
# Provider selection
[ProviderFactory] Using provider: openrouter
[ProviderFactory] Fallback enabled: true, fallback provider: gemini

# Analysis attempts  
[openrouter] Starting comprehensive analysis
[openrouter] Analysis completed successfully in 2300ms

# Fallback events
[FallbackProvider] Primary provider openrouter failed: Model overloaded
[FallbackProvider] Attempting fallback to: gemini
[FallbackProvider] Fallback provider gemini succeeded in 1800ms

# Health checks
[FallbackProvider] Health check - Primary: false, Fallback: true, Overall: true
```

### Monitoring Setup

For production monitoring, track these metrics:

1. **Provider Success Rates**
   - Primary provider success/failure ratio
   - Fallback provider success/failure ratio
   - Overall system availability

2. **Response Times**
   - Average response time per provider
   - 95th percentile response times
   - Timeout frequency

3. **Fallback Events**
   - Fallback trigger frequency
   - Fallback success rate
   - Most common fallback triggers

4. **Error Patterns**
   - Most common error types
   - Provider-specific error rates
   - Time-based error patterns

---

## Deployment Guide

### Prerequisites

Before deployment, ensure:

1. **API Keys**: Valid API keys for selected providers
2. **Network Access**: Outbound HTTPS access to provider APIs
3. **Environment Variables**: All required configuration set
4. **Dependencies**: All npm packages installed

### Deployment Steps

#### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

#### 2. API Key Setup

##### For OpenRouter:
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create account and generate API key
3. Configure data policy at [Privacy Settings](https://openrouter.ai/settings/privacy)
4. Add key to environment: `OPENROUTER_API_KEY=your_key_here`

##### For Gemini:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate API key
3. Add key to environment: `GEMINI_API_KEY=your_key_here`

#### 3. Provider Selection

Choose deployment strategy:

##### Option A: Gemini Only (Safe, Free)
```bash
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=false
```

##### Option B: OpenRouter Only (Higher Quality)
```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=false
```

##### Option C: OpenRouter with Gemini Fallback (Recommended)
```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
```

#### 4. Validation

Test configuration before deployment:

```bash
# Start development server
npm run dev

# Test analysis endpoint
curl -X POST http://localhost:3000/api/crucible/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "problemId": "test_problem_id",
    "userSolution": "console.log(\"Hello World\");"
  }'
```

#### 5. Production Deployment

```bash
# Build application
npm run build

# Start production server
npm start
```

### Gradual Rollout Strategy

For production environments, consider gradual rollout:

#### Phase 1: Staging Validation
- Deploy with OpenRouter + Gemini fallback on staging
- Test with real problem submissions
- Monitor error rates and response times

#### Phase 2: Canary Deployment
- Deploy to small percentage of production traffic
- Monitor fallback events and error patterns
- Validate analysis quality

#### Phase 3: Full Rollout
- Gradually increase traffic percentage
- Monitor system performance
- Be ready to rollback if issues occur

---

## Troubleshooting

### Common Issues

#### 1. 404 Model Not Found (OpenRouter)

**Symptoms:**
```
OpenRouter error: 404 - Model not found
```

**Causes:**
- Invalid model name in `OPENROUTER_ANALYSIS_MODEL`
- Model not available in your region
- Model requires higher access tier

**Solutions:**
1. Verify model name in [OpenRouter Models](https://openrouter.ai/models)
2. Use recommended model: `anthropic/claude-3.5-sonnet`
3. Check model availability for your account tier
4. For free tier, use: `meta-llama/llama-3.1-8b-instruct:free`

#### 2. Authentication Errors

**Symptoms:**
```
AuthenticationError: Invalid API key or insufficient permissions
```

**Solutions:**
1. Verify API key format and validity
2. Check API key permissions
3. Ensure correct environment variable names
4. Test API key with provider's official documentation

#### 3. Fallback Not Working

**Symptoms:**
- Errors not triggering fallback
- Both providers failing

**Diagnostics:**
```typescript
// Check provider configuration
const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
console.log('Provider name:', provider.getProviderName());
console.log('Config:', provider.getConfiguration());

// Check health status
const healthy = await provider.isHealthy();
console.log('Provider healthy:', healthy);
```

**Solutions:**
1. Verify `ENABLE_ANALYSIS_FALLBACK=true`
2. Ensure fallback provider has valid API key
3. Check that fallback provider differs from primary
4. Verify error is retryable (not authentication/configuration)

#### 4. High Response Times

**Symptoms:**
- Slow analysis responses
- Timeout errors

**Diagnostics:**
```typescript
// Check metrics
const metrics = provider.getMetrics();
console.log('Average response time:', metrics.primaryProvider.averageResponseTime);
```

**Solutions:**
1. Increase `ANALYSIS_PROVIDER_TIMEOUT`
2. Consider switching to faster provider
3. Check network connectivity
4. Monitor provider status pages

#### 5. Configuration Validation Errors

**Symptoms:**
```
ConfigurationError: ANALYSIS_PROVIDER is required
```

**Solutions:**
1. Verify all required environment variables are set
2. Check environment variable names (case-sensitive)
3. Restart application after configuration changes
4. Validate configuration format

### Debug Mode

Enable debug logging for troubleshooting:

```bash
DEBUG=solution-analysis:* npm start
```

This provides detailed logs for:
- Provider selection process
- API request/response details
- Error handling flow
- Fallback decision logic

### Health Check Endpoints

Monitor system health:

```bash
# Check provider health
curl http://localhost:3000/api/health/providers

# Expected response:
{
  "primary": {
    "provider": "openrouter",
    "healthy": true,
    "responseTime": 234
  },
  "fallback": {
    "provider": "gemini", 
    "healthy": true,
    "responseTime": 456
  }
}
```

---

## Best Practices

### 1. Provider Selection

#### For Development
- **Recommended**: Gemini (free, reliable)
- **Fallback**: Not required for development

```bash
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=false
```

#### For Production
- **Recommended**: OpenRouter with Gemini fallback
- **Rationale**: Higher quality analysis with reliability backup

```bash
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
```

### 2. API Key Management

#### Security Best Practices
1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive configuration
3. **Rotate API keys** regularly
4. **Monitor API key usage** for unusual patterns
5. **Use separate keys** for development and production

#### Key Storage
```bash
# Good: Environment variables
export OPENROUTER_API_KEY="or-v1-..."
export GEMINI_API_KEY="AIza..."

# Bad: Hardcoded in code
const apiKey = "or-v1-abc123..."; // Never do this!
```

### 3. Error Handling

#### Graceful Degradation
```typescript
try {
  const result = await generateComprehensiveAnalysis(...);
  return result;
} catch (error) {
  // Log error for monitoring
  logger.error('Analysis failed', { error, problemId });
  
  // Return fallback response or user-friendly error
  if (error instanceof AuthenticationError) {
    throw new Error('Service temporarily unavailable. Please try again later.');
  }
  
  throw error;
}
```

#### Monitoring Integration
```typescript
// Track metrics for operational insights
const startTime = Date.now();
try {
  const result = await generateComprehensiveAnalysis(...);
  metrics.increment('analysis.success');
  metrics.timing('analysis.duration', Date.now() - startTime);
  return result;
} catch (error) {
  metrics.increment('analysis.failure');
  metrics.increment(`analysis.error.${error.constructor.name}`);
  throw error;
}
```

### 4. Performance Optimization

#### Provider Caching
- Providers are automatically cached for performance
- No need to implement additional caching

#### Response Time Monitoring
```typescript
// Monitor and alert on slow responses
const RESPONSE_TIME_THRESHOLD = 5000; // 5 seconds

const responseTime = metrics.averageResponseTime;
if (responseTime > RESPONSE_TIME_THRESHOLD) {
  logger.warn('Slow analysis response', { responseTime });
  // Consider switching providers or investigating
}
```

### 5. Testing Strategy

#### Unit Testing
```typescript
// Test provider selection
describe('Provider Selection', () => {
  it('should select OpenRouter when configured', () => {
    process.env.ANALYSIS_PROVIDER = 'openrouter';
    const provider = SolutionAnalysisProviderFactory.getPrimaryProvider();
    expect(provider.getProviderName()).toContain('openrouter');
  });
});

// Test fallback behavior
describe('Fallback Strategy', () => {
  it('should fallback on model overload', async () => {
    // Mock primary provider to fail
    // Verify fallback provider is called
  });
});
```

#### Integration Testing
```typescript
// Test end-to-end analysis flow
describe('Analysis Integration', () => {
  it('should complete analysis with real providers', async () => {
    // Skip if no API keys available
    if (!process.env.OPENROUTER_API_KEY) return;
    
    const result = await generateComprehensiveAnalysis(...);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });
});
```

### 6. Monitoring and Alerting

#### Key Metrics to Monitor
1. **Analysis Success Rate** (target: >99%)
2. **Average Response Time** (target: <3 seconds)
3. **Fallback Trigger Rate** (investigate if >5%)
4. **Provider Health Status** (alert if unhealthy)

#### Alerting Rules
```bash
# High error rate
if (error_rate > 5%) {
  alert("Solution analysis error rate too high");
}

# Slow responses
if (avg_response_time > 5000) {
  alert("Solution analysis responses too slow");
}

# Provider health
if (provider_health == false) {
  alert("Solution analysis provider unhealthy");
}
```

### 7. Documentation Maintenance

#### Keep Documentation Updated
1. **Environment changes**: Update configuration examples
2. **New providers**: Document integration steps
3. **Error patterns**: Add to troubleshooting guide
4. **Performance insights**: Share optimization findings

#### Team Communication
1. **Provider changes**: Notify team of configuration changes
2. **Incident reports**: Share learnings from production issues
3. **Performance reports**: Regular analysis quality and performance reviews

---

## Conclusion

The Solution Analysis Provider Migration provides a robust, scalable foundation for AI-powered solution analysis. With proper configuration and monitoring, it delivers high availability and quality analysis while maintaining complete backward compatibility.

### Key Benefits

1. **Flexibility**: Easy switching between AI providers
2. **Reliability**: Automatic fallback for high availability
3. **Monitoring**: Comprehensive metrics and logging
4. **Compatibility**: Zero breaking changes to existing code
5. **Scalability**: Ready for future provider additions

### Next Steps

1. **Configure** your preferred provider setup
2. **Deploy** with appropriate monitoring
3. **Monitor** performance and error patterns
4. **Optimize** based on usage insights
5. **Scale** as your needs grow

For additional support or questions, refer to the project documentation or reach out to the development team.

---

*Last Updated: January 4, 2025*
*Version: 1.0*