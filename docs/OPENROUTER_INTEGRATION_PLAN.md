# OpenRouter Integration Implementation Plan

## Overview
This plan outlines the integration of OpenRouter as the primary AI provider while maintaining Gemini as a fallback, with the goal of eventually removing Gemini entirely. All existing functionality (chat, solution analysis, hint generation, web search) must continue working seamlessly.

## Key Findings from Research

### OpenRouter Web Search Support ✅
- **Primary approach (SerpAPI-first)**: We will continue using our existing SerpAPI integration to fetch web/news/scholar/answer-box results and inject concise summaries into the prompt. This is provider-agnostic and works for both Gemini and OpenRouter with zero UI/API changes.
- **Native OpenRouter web search (optional)**: Available via `:online` model suffix (e.g., `openai/gpt-4o:online`) or the web plugin `plugins: [{"id": "web", "max_results": 5}]`.
- **Pricing**: $4 per 1000 web results (default 5 results = $0.02 per request) when using OpenRouter web plugin/online.
- **Standardized format**: OpenRouter web search returns citations in OpenAI-compatible annotation schema.
- **Fallback compatibility**: If OpenRouter-native search is enabled but fails or is disabled, we fall back to SerpAPI seamlessly.

### Error Handling Best Practices
- **Standard HTTP codes**: 400, 401, 402, 403, 408, 429, 502, 503
- **Structured metadata**: Provider errors include `provider_name` and `raw` error details
- **Retry logic**: Recommended for 502/503 errors and no-content responses
- **Logging**: OpenRouter does zero logging by default (privacy-first)

## Architecture Principles

1. **Provider Abstraction**: Clean interface that makes Gemini removal trivial
2. **Fallback Strategy**: OpenRouter primary → Gemini fallback → Graceful error
3. **Zero UI Changes**: All existing endpoints and SSE formats preserved
4. **Environment-Driven**: Provider selection via `AI_PROVIDER` env variable
5. **Feature Parity**: All AI capabilities work identically across providers
6. **Web Search Strategy**: SerpAPI-first (provider-agnostic prompt injection). OpenRouter-native web search is optional behind env flags and always falls back to SerpAPI.

## Implementation Phases

### Phase 1: Provider Abstraction Layer
**Goal**: Create clean abstractions that isolate provider-specific logic

#### Files to Modify:
- `backend/src/services/ai.service.ts`

#### Changes:
1. **Add Provider Types & Interfaces**
   ```typescript
   export type AIProvider = 'openrouter' | 'gemini';
   
   interface AIProviderConfig {
     provider: AIProvider;
     apiKey: string;
     model?: string;
     baseUrl?: string;
   }
   
   interface AIProviderClient {
     generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse>;
     generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse>;
     analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis>;
     generateHints(problem: ICrucibleProblem): Promise<string[]>;
   }
   ```

2. **Provider Resolution Logic**
   ```typescript
   const resolveProvider = (): AIProvider => {
     const provider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider;
     return ['openrouter', 'gemini'].includes(provider) ? provider : 'gemini';
   };
   
   const getProviderConfig = (provider: AIProvider): AIProviderConfig => {
     switch (provider) {
       case 'openrouter':
         return {
           provider: 'openrouter',
           apiKey: process.env.OPENROUTER_API_KEY || '',
           model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
           baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
         };
       case 'gemini':
       default:
         return {
           provider: 'gemini',
           apiKey: process.env.GEMINI_API_KEY || '',
           model: 'gemini-2.5-flash'
         };
     }
   };
   ```

3. **Refactor Existing Functions**
   - Extract current Gemini logic into `GeminiProvider` class
   - Update main functions to use provider abstraction
   - Maintain exact same function signatures

#### Success Criteria:
- All existing functionality works unchanged
- Provider switching logic is in place
- Code is ready for OpenRouter implementation

### Phase 2: OpenRouter Provider Implementation
**Goal**: Implement full OpenRouter client with streaming and web search support

#### Files to Modify:
- `backend/src/services/ai.service.ts`
- `backend/src/services/openrouter.client.ts` (new)

#### Changes:
1. **Create OpenRouter Client** (`openrouter.client.ts`)
   ```typescript
   export class OpenRouterClient implements AIProviderClient {
     private config: AIProviderConfig;
     
     constructor(config: AIProviderConfig) {
       this.config = config;
     }
     
     async generateResponse(messages: IChatMessage[], context?: any): Promise<IChatResponse> {
       // Non-streaming implementation
     }
     
     async* generateStreamingResponse(messages: IChatMessage[], context?: any): AsyncGenerator<IStreamingChatResponse> {
       // Streaming implementation with SSE parsing
     }
     
     async analyzeSolution(content: string, problem: ICrucibleProblem): Promise<ISolutionAnalysis> {
       // Solution analysis implementation
     }
     
     async generateHints(problem: ICrucibleProblem): Promise<string[]> {
       // Hint generation implementation
     }
   }
   ```

2. **Web Search Integration**
   - Primary: Keep existing SerpAPI flow (detection via `shouldUseWebSearch`, fetch via `serpapi.service`, prompt injection of concise, capped results). No behavioral change for UI or endpoints.
   - Optional (env-gated): Enable OpenRouter-native web search when `WEB_SEARCH_PROVIDER=openrouter` and/or `OPENROUTER_MODEL` uses `:online`, or `plugins: [{ id: 'web' }]` is set.
   - Fallback: If OpenRouter-native search errors, times out, or lacks credits, fall back to SerpAPI for the same request.
   - Normalization: If OpenRouter citations are returned, allow them to pass through as markdown links; otherwise rely on injected SerpAPI summaries.

3. **Streaming Implementation**
   - Handle OpenRouter SSE format
   - Convert to existing `IStreamingChatResponse` format
   - Implement proper error handling and connection management

4. **Error Handling & Retry Logic**
   - Map OpenRouter error codes to appropriate responses
   - Implement retry logic for 502/503 errors
   - Add structured logging with provider context

#### Success Criteria:
- OpenRouter client handles all AI operations
- Streaming works identically to Gemini
- Web search integration functional: SerpAPI-first with optional OpenRouter-native search enabled via env and seamless fallback
- Error handling robust and informative

### Phase 3: Fallback Strategy Implementation
**Goal**: Implement seamless fallback from OpenRouter to Gemini

#### Files to Modify:
- `backend/src/services/ai.service.ts`

#### Changes:
1. **Fallback Logic**
   ```typescript
   const executeWithFallback = async <T>(
     operation: () => Promise<T>,
     fallbackOperation: () => Promise<T>,
     operationName: string
   ): Promise<T> => {
     try {
       return await operation();
     } catch (error) {
       console.warn(`${operationName} failed with primary provider, falling back to Gemini:`, error);
       return await fallbackOperation();
     }
   };
   ```

2. **Provider Chain**
   - Primary: OpenRouter (if configured and available)
   - Fallback: Gemini (if API key available)
   - Final: Graceful error message

3. **Logging & Monitoring**
   - Log provider switches for monitoring
   - Track success/failure rates per provider
   - Structured error context with provider information

#### Success Criteria:
- Automatic fallback on OpenRouter failures
- No user-visible disruption during provider switches
- Comprehensive logging for debugging

### Phase 4: Environment Configuration & Validation
**Goal**: Add robust configuration management and validation

#### Files to Modify:
- `backend/.env.example`
- `backend/src/config/ai.config.ts` (new)
- `backend/src/services/ai.service.ts`

#### Changes:
1. **Environment Variables** (`.env.example`)
   ```env
   # AI Provider Configuration
   AI_PROVIDER=openrouter # openrouter | gemini
   
   # OpenRouter Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_APP_NAME=Zemon-AI-Chat
   OPENROUTER_SITE_URL=https://zemondev.onrender.com
   
   # Gemini Configuration (Fallback)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Web Search Configuration
   ENABLE_WEB_SEARCH=true
   WEB_SEARCH_PROVIDER=serpapi # serpapi (default, provider-agnostic) | openrouter
   SERPAPI_KEY=your_serpapi_api_key_here
   ```

2. **Configuration Validation** (`ai.config.ts`)
   ```typescript
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
   
   export const validateAIConfig = (): AIConfig => {
     // Validation logic with helpful error messages
   };
   ```

3. **Startup Validation**
   - Validate configuration on service startup
   - Warn about missing fallback options
   - Provide clear error messages for misconfiguration

#### Success Criteria:
- Clear configuration documentation
- Robust validation with helpful error messages
- Graceful degradation when keys are missing

### Phase 5: Testing & Validation
**Goal**: Comprehensive testing across all AI features and providers

#### Test Categories:

1. **Unit Tests**
   - Provider abstraction layer
   - OpenRouter client functionality
   - Fallback logic
   - Configuration validation

2. **Integration Tests**
   - All AI endpoints with both providers
   - Streaming functionality
   - Web search integration
   - Error handling scenarios

3. **End-to-End Tests**
   - Complete chat flows
   - Solution analysis workflows
   - Hint generation
   - Provider fallback scenarios

4. **Performance Tests**
   - Streaming latency comparison
   - Fallback timing
   - Memory usage
   - Rate limiting behavior

#### Test Scenarios:
- ✅ OpenRouter primary, Gemini fallback available
- ✅ OpenRouter primary, no Gemini fallback
- ✅ OpenRouter unavailable, Gemini fallback
- ✅ Both providers unavailable
- ✅ Invalid API keys
- ✅ Rate limiting scenarios
- ✅ Network timeout scenarios
- ✅ Streaming interruption handling

#### Success Criteria:
- All existing functionality preserved
- No performance degradation
- Robust error handling
- Seamless provider switching

## Migration Timeline

### Immediate (Phase 1-2)
- Implement provider abstraction
- Add OpenRouter client
- Basic functionality working

### Short-term (Phase 3-4)
- Fallback strategy implemented
- Configuration management
- Production-ready deployment

### Long-term (Phase 5+)
- Comprehensive testing
- Performance optimization
- Gemini deprecation preparation

## Rollback Strategy

1. **Environment Variable**: Set `AI_PROVIDER=gemini` to revert
2. **Code Isolation**: All OpenRouter code in separate modules
3. **Feature Flags**: Can disable OpenRouter features independently
4. **Monitoring**: Track provider performance and switch if needed

## Success Metrics

- **Functionality**: 100% feature parity between providers
- **Performance**: <10% latency increase vs current Gemini implementation
- **Reliability**: <1% additional error rate from provider switching
- **Maintainability**: Clean abstractions that make Gemini removal trivial

## Future Gemini Removal

When ready to remove Gemini:
1. Set `AI_PROVIDER=openrouter` in all environments
2. Remove Gemini-specific code from `ai.service.ts`
3. Remove `GEMINI_API_KEY` from configuration
4. Update documentation and deployment scripts
5. Clean up unused dependencies

The abstraction layer ensures this removal will be a simple code deletion with no architectural changes required.

## Implementation Changelog

### Phase 4 - Environment Configuration & Validation (Completed)
**Date**: 2025-09-03  
**Status**: ✅ Completed

#### Changes Made:
1. **AI Configuration Module** (`backend/src/config/ai.config.ts`):
   - Created comprehensive configuration validation system
   - Added `AIConfig` interface with structured configuration options
   - Implemented `validateAIConfig()` with detailed error and warning messages
   - Added `getAIConfig()` function with startup validation and error handling

2. **Environment Variables** (`.env.example`):
   - Added complete OpenRouter configuration section
   - Updated AI provider configuration with clear examples
   - Added web search provider configuration options
   - Organized environment variables by functional groups

3. **Startup Validation**:
   - Added configuration validation on AI service initialization
   - Implemented graceful error handling with helpful error messages
   - Added structured logging of configuration status
   - Process exits with clear error message if configuration is invalid

4. **Configuration Status API**:
   - Added `getConfigurationStatus()` function for runtime configuration monitoring
   - Added `validateCurrentConfig()` function for on-demand validation
   - Exported configuration validation functions for external use

5. **Enhanced Error Messages**:
   - Detailed validation for API keys, model formats, and URL structures
   - Helpful warnings for missing fallback configurations
   - Clear guidance for fixing configuration issues

#### Technical Details:
- **Validation Rules**: API key length checks, model format validation, URL structure validation
- **Startup Safety**: Service fails fast with clear error messages if misconfigured
- **Runtime Monitoring**: Configuration status available via exported functions
- **Graceful Degradation**: Warnings for missing optional configurations
- **Security**: No sensitive data logged or exposed in status functions

#### Environment Variables Added:
```env
# AI Provider Configuration
AI_PROVIDER=openrouter # openrouter | gemini

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_REFERER=https://zemondev.onrender.com
OPENROUTER_TITLE=Zemon AI Tutor

# Gemini Configuration (Fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# Web Search Configuration
ENABLE_WEB_SEARCH=true
WEB_SEARCH_PROVIDER=serpapi # serpapi | openrouter
SERPAPI_KEY=your_serpapi_api_key_here
```

#### Impact:
- **Production Ready**: Robust configuration validation prevents runtime failures
- **Developer Friendly**: Clear error messages and warnings guide proper setup
- **Monitoring Ready**: Configuration status available for health checks and debugging
- **Secure**: No sensitive data exposure in logs or status endpoints
- **Maintainable**: Centralized configuration management

#### Files Modified:
- `backend/src/config/ai.config.ts`: New configuration module
- `backend/src/services/ai.service.ts`: Updated to use configuration validation
- `backend/.env.example`: Added comprehensive environment variable documentation

### Phase 3 - Fallback Strategy Implementation (Completed)
**Date**: 2025-09-03  
**Status**: ✅ Completed

#### Changes Made:
1. **Fallback Logic Implementation**:
   - Added `executeWithFallback()` function for async operations with automatic fallback
   - Added `executeStreamingWithFallback()` function for streaming operations with fallback
   - Implemented comprehensive error handling with structured logging

2. **Provider Performance Tracking**:
   - Added `ProviderMetrics` interface to track success/failure/fallback counts
   - Implemented `logProviderEvent()` function for structured logging with timestamps
   - Added provider performance monitoring with detailed console output

3. **FallbackAwareProvider Class**:
   - Created wrapper class that handles all AI operations with automatic fallback
   - Integrated performance tracking and logging into all operations
   - Added methods to get and reset provider metrics for monitoring

4. **Provider Chain Implementation**:
   - Primary: OpenRouter (when `AI_PROVIDER=openrouter`)
   - Fallback: Gemini (automatically created when primary is not Gemini)
   - Final: Graceful error handling if both providers fail

5. **Monitoring & Logging**:
   - Structured console logging with emojis for easy identification
   - Success/failure/fallback event tracking with timestamps
   - Exported `getProviderMetrics()` and `resetProviderMetrics()` functions

#### Technical Details:
- **Automatic Fallback**: On any OpenRouter failure, seamlessly switches to Gemini
- **Performance Tracking**: Tracks success rates, failure counts, and fallback frequency
- **Logging Format**: `✅ success`, `❌ failure`, `🔄 fallback` with operation names and counts
- **Zero Latency Impact**: Fallback only occurs on actual failures, not proactively
- **Streaming Support**: Fallback works for both regular and streaming operations

#### Impact:
- **Seamless User Experience**: Users never see provider failures, only successful responses
- **Monitoring Ready**: Full visibility into provider performance and reliability
- **Production Safe**: Robust error handling ensures system stability
- **Debug Friendly**: Detailed logging helps identify and resolve provider issues

#### Files Modified:
- `backend/src/services/ai.service.ts`: Added complete fallback strategy implementation

### Phase 2 - OpenRouter Client Implementation (Completed)
**Date**: 2025-09-03  
**Status**: Completed

#### Changes Made:
1. **OpenRouterProvider Class**:
   - Implemented complete `OpenRouterProvider` class with full feature parity to GeminiProvider
   - Added support for all AI service methods: chat, streaming, solution analysis, hints
   - Integrated same intelligent web search logic and prompt structures as Gemini

2. **OpenRouter API Integration**:
   - Implemented OpenRouter Chat Completions API with proper authentication headers
   - Added streaming support using Server-Sent Events (SSE) parsing
   - Configured proper OpenRouter headers: `HTTP-Referer`, `X-Title`, `Authorization`
   - Used configurable base URL, model, and API key from environment variables

3. **Prompt Parity**:
   - Preserved exact same system prompts and prompt engineering as Gemini
   - Maintained identical web search integration and context formatting
   - Converted message format from Gemini to OpenRouter's role-based format
   - Kept same intelligent web search detection and integration logic

4. **Error Handling & Fallback**:
   - Added comprehensive error handling for OpenRouter API failures
   - Implemented proper JSON parsing with fallback for malformed responses
   - Added graceful degradation for streaming connection issues
   - Maintained same error message patterns as Gemini for consistency

5. **Configuration Support**:
   - Added support for `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL` environment variables
   - Added optional `OPENROUTER_REFERER` and `OPENROUTER_TITLE` for API attribution
   - Updated provider factory to instantiate OpenRouterProvider correctly

#### Technical Details:
- **Streaming Implementation**: Uses fetch with ReadableStream for real-time response chunks
- **Message Format**: Converts IChatMessage[] to OpenRouter's system/user/assistant format
- **Web Search**: Same `shouldUseWebSearch()` and `performIntelligentWebSearch()` integration
- **JSON Parsing**: Robust parsing for solution analysis and hint generation responses
- **Rate Limiting**: Inherits existing rate limiting through provider abstraction
#### Impact:
- ✅ **Zero Breaking Changes**: All existing functionality preserved
- ✅ **Provider Switching Ready**: `AI_PROVIDER=gemini` works immediately
- ✅ **Clean Abstractions**: Easy Gemini removal in future phases
- ✅ **Fallback Safety**: Automatic fallback to Gemini on provider creation errors
- ✅ **Web Search Preserved**: SerpAPI integration works identically across providers

#### Next Phase Ready:
- Phase 2 can now implement OpenRouter client by creating `OpenRouterProvider` class
- All exported function signatures remain unchanged
- Provider switching via environment variable functional
