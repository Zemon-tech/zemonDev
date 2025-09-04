# Solution Analysis Provider - Deployment Checklist

## Pre-Deployment Validation

### 1. Environment Configuration ✓

#### Required Variables
- [ ] `ANALYSIS_PROVIDER` is set (`gemini` or `openrouter`)
- [ ] Primary provider API key is set and valid
- [ ] If using fallback: `ENABLE_ANALYSIS_FALLBACK=true`
- [ ] If using fallback: Fallback provider API key is set and valid

#### Configuration Validation
```bash
# Check configuration
node -e "
const env = require('./backend/src/config/env.ts');
console.log('Provider:', env.default.ANALYSIS_PROVIDER);
console.log('Fallback enabled:', env.default.ENABLE_ANALYSIS_FALLBACK);
console.log('Timeout:', env.default.ANALYSIS_PROVIDER_TIMEOUT);
"
```

### 2. API Key Validation ✓

#### Test Gemini API Key
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}"
```

#### Test OpenRouter API Key
```bash
curl -H "Authorization: Bearer ${OPENROUTER_API_KEY}" \
     -H "Content-Type: application/json" \
     "https://openrouter.ai/api/v1/models"
```

### 3. Provider Health Checks ✓

```bash
# Start the server temporarily and test health
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test provider health (add your actual health endpoint)
curl http://localhost:3000/api/health/analysis-providers

# Clean up
kill $SERVER_PID
```

### 4. Dependencies ✓

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Check for vulnerabilities
npm audit

# Build test
npm run build
```

## Deployment Steps

### 1. Environment Setup

#### Production Environment Variables
```bash
# Copy and customize environment template
cp backend/.env.example backend/.env

# Required customizations:
# - Set ANALYSIS_PROVIDER
# - Add valid API keys
# - Configure fallback if desired
# - Set NODE_ENV=production
```

#### Recommended Production Configuration
```bash
# High availability setup
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=true
ANALYSIS_FALLBACK_PROVIDER=gemini
ANALYSIS_PROVIDER_TIMEOUT=30000

# API Keys
OPENROUTER_API_KEY=your_openrouter_key_here
GEMINI_API_KEY=your_gemini_key_here

# OpenRouter Configuration
OPENROUTER_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_APP_NAME=ZemonDev-Crucible
OPENROUTER_SITE_URL=https://your-domain.com
```

### 2. Build and Start

```bash
# Build frontend
cd frontend
npm run build

# Build backend (if applicable)
cd ../backend
npm run build

# Start production server
npm start
```

### 3. Post-Deployment Validation

#### Functional Testing
```bash
# Test analysis endpoint
curl -X POST http://your-domain.com/api/crucible/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_test_jwt" \
  -d '{
    "problemId": "test_problem_id", 
    "userSolution": "function test() { return \"hello\"; }"
  }'
```

#### Provider Status Check
```bash
# Check which provider is active
grep -A 10 "Using provider:" /path/to/your/logs

# Check for fallback events
grep "Fallback provider" /path/to/your/logs
```

## Monitoring Setup

### 1. Log Monitoring

#### Key Log Patterns to Monitor
```bash
# Provider selection
"Using provider: (gemini|openrouter)"

# Successful analysis
"Analysis completed successfully"

# Fallback events
"Attempting fallback to:"
"Fallback provider .* succeeded"

# Errors
"Analysis failed:"
"Provider .* failed:"
```

#### Log Aggregation Queries
```bash
# Error rate monitoring
grep -c "Analysis failed" logs.txt

# Fallback frequency
grep -c "Attempting fallback" logs.txt

# Average response times
grep "completed successfully" logs.txt | sed 's/.*in \([0-9]*\)ms.*/\1/' | awk '{sum+=$1; n++} END {print sum/n}'
```

### 2. Application Metrics

#### Key Metrics to Track
- [ ] Analysis success rate (target: >99%)
- [ ] Average response time (target: <3000ms)
- [ ] Fallback trigger rate (investigate if >5%)
- [ ] Provider-specific error rates
- [ ] API quota usage (for paid providers)

#### Alerting Rules
```bash
# High error rate alert
if (analysis_error_rate_5min > 0.05) {
  alert("Solution analysis error rate > 5%");
}

# Slow response alert  
if (analysis_avg_response_time_5min > 5000) {
  alert("Solution analysis slow responses");
}

# Provider unhealthy alert
if (provider_health_check_failed) {
  alert("Solution analysis provider unhealthy");
}
```

### 3. External Monitoring

#### Provider Status Pages
- [ ] Monitor [OpenRouter Status](https://status.openrouter.ai/)
- [ ] Monitor [Google AI Status](https://status.cloud.google.com/)
- [ ] Set up status page notifications

#### API Quota Monitoring
- [ ] OpenRouter: Monitor usage at [OpenRouter Dashboard](https://openrouter.ai/activity)
- [ ] Gemini: Monitor usage at [Google AI Studio](https://makersuite.google.com/)

## Rollback Plan

### 1. Quick Provider Switch

#### Switch to Gemini Only
```bash
# Update environment
ANALYSIS_PROVIDER=gemini
ENABLE_ANALYSIS_FALLBACK=false

# Restart application
systemctl restart your-app-service
```

#### Switch to OpenRouter Only
```bash
# Update environment  
ANALYSIS_PROVIDER=openrouter
ENABLE_ANALYSIS_FALLBACK=false

# Restart application
systemctl restart your-app-service
```

### 2. Disable Fallback
```bash
# If fallback is causing issues
ENABLE_ANALYSIS_FALLBACK=false

# Restart application
systemctl restart your-app-service
```

### 3. Emergency Rollback

#### Complete Rollback to Previous Version
```bash
# Stop current deployment
systemctl stop your-app-service

# Restore previous configuration
cp .env.backup .env

# Restart with previous version
git checkout previous-release-tag
npm install
npm run build
systemctl start your-app-service
```

## Troubleshooting

### Common Post-Deployment Issues

#### Provider Not Found Error
```bash
# Check environment variable
echo $ANALYSIS_PROVIDER

# Valid values: "gemini" or "openrouter"
# Fix: Update environment and restart
```

#### API Key Authentication Errors
```bash
# Verify API key format
echo $OPENROUTER_API_KEY | grep "^or-v1-"  # Should match
echo $GEMINI_API_KEY | grep "^AIza"        # Should match

# Test API key manually (see validation section above)
```

#### Fallback Not Working
```bash
# Check fallback configuration
echo $ENABLE_ANALYSIS_FALLBACK  # Should be exactly "true"
echo $ANALYSIS_FALLBACK_PROVIDER

# Verify fallback provider API key exists
```

#### High Response Times
```bash
# Check timeout setting
echo $ANALYSIS_PROVIDER_TIMEOUT  # Default: 30000

# Monitor response times in logs
grep "completed successfully" logs.txt | tail -20

# Consider increasing timeout or switching providers
```

### Performance Optimization

#### Response Time Optimization
1. **Increase timeout** if needed: `ANALYSIS_PROVIDER_TIMEOUT=45000`
2. **Use faster model** for OpenRouter: `openai/gpt-4o-mini`
3. **Enable fallback** for redundancy: `ENABLE_ANALYSIS_FALLBACK=true`
4. **Monitor provider status** and switch if consistently slow

#### Cost Optimization
1. **Use free models** for development: `meta-llama/llama-3.1-8b-instruct:free`
2. **Monitor usage** via provider dashboards
3. **Set usage alerts** to avoid unexpected charges
4. **Consider Gemini** for cost-effective production use

## Security Checklist

### API Key Security
- [ ] API keys stored in environment variables only
- [ ] No API keys committed to version control
- [ ] API keys rotated regularly
- [ ] Access to API keys restricted to necessary personnel
- [ ] API key usage monitored for unusual patterns

### Network Security
- [ ] HTTPS enforced for all API communications
- [ ] Outbound firewall rules allow necessary provider APIs
- [ ] No sensitive data logged in provider requests
- [ ] Request/response data encrypted in transit

### Monitoring Security
- [ ] Log access restricted to authorized personnel
- [ ] API key leakage monitoring in logs
- [ ] Automated security scanning in CI/CD pipeline

## Success Criteria

### Functional Requirements
- [ ] Solution analysis completes successfully
- [ ] Response structure matches expected format
- [ ] Error handling works appropriately
- [ ] Fallback activates when configured and needed

### Performance Requirements
- [ ] Response time < 5 seconds (95th percentile)
- [ ] Success rate > 99%
- [ ] Fallback rate < 5% (when enabled)

### Operational Requirements
- [ ] Monitoring and alerting configured
- [ ] Logs accessible and searchable
- [ ] Rollback procedure tested
- [ ] Team trained on troubleshooting

---

## Post-Deployment Actions

### Week 1: Close Monitoring
- [ ] Daily log review for errors and patterns
- [ ] Performance metrics baseline establishment  
- [ ] User feedback collection
- [ ] Any needed configuration adjustments

### Week 2-4: Optimization
- [ ] Performance tuning based on metrics
- [ ] Cost analysis and optimization
- [ ] Provider comparison analysis
- [ ] Documentation updates based on learnings

### Month 2+: Maintenance
- [ ] Regular health checks and monitoring review
- [ ] API key rotation schedule
- [ ] Provider performance comparisons
- [ ] Planning for future enhancements

---

*Last Updated: January 4, 2025*
*Deployment Version: 1.0*