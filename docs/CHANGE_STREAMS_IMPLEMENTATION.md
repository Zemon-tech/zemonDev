# Change Streams Implementation for Real-time Notifications

## Overview

This document describes the implementation of MongoDB Change Streams in the Quild user backend to provide real-time notifications when admin-created notifications are inserted into the database.

## Architecture

```
Admin Backend → MongoDB → Change Streams → User Backend → Socket.IO → User Frontend
     ↓              ↓           ↓              ↓           ↓           ↓
Creates        Stores      Watches for     Processes    Emits to    Receives
Notification   Document    Changes         Changes      User        Real-time
```

## Components

### 1. Change Streams Service (`backend/src/services/changeStreams.service.ts`)

**Purpose**: Watches the notifications collection for new inserts and emits them via Socket.IO.

**Key Features**:
- **Feature Flag Control**: Enabled/disabled via `ENABLE_CHANGE_STREAMS` environment variable
- **Resume Token Persistence**: Stores and resumes from the last processed change to avoid missing events
- **Error Handling**: Automatic restart on errors with exponential backoff
- **MongoDB Replica Set Check**: Verifies Change Streams compatibility before starting

**Configuration**:
```typescript
interface ChangeStreamConfig {
  enabled: boolean;
  resumeTokenCollection: string;
  resumeTokenDocumentId: string;
}
```

### 2. Health Controller (`backend/src/controllers/health.controller.ts`)

**Purpose**: Provides endpoints to monitor the health of the Change Streams service.

**Endpoints**:
- `GET /api/health` - Overall system health
- `GET /api/health/change-streams` - Change Streams service status

### 3. Health Routes (`backend/src/api/health.routes.ts`)

**Purpose**: Routes for health check endpoints.

### 4. Server Integration (`backend/src/index.ts`)

**Purpose**: Integrates the Change Streams service into the main server lifecycle.

**Integration Points**:
- Service initialization after server startup
- Graceful shutdown handling
- Error handling for uncaught exceptions and unhandled rejections

## Environment Variables

### Required
- `ENABLE_CHANGE_STREAMS`: Set to `'true'` to enable the service (default: `false`)

### Optional
- All existing environment variables remain unchanged

## Database Requirements

### MongoDB Configuration
- **Replica Set**: Change Streams require MongoDB to run as a replica set
- **Permissions**: Database user must have `changeStream` capability
- **Collections**: 
  - `notifications` - Main notifications collection
  - `changeStreamResumeTokens` - Resume token storage

### Resume Token Storage
The service automatically creates a collection to store resume tokens:
```typescript
{
  _id: 'notifications',
  token: 'resume_token_here',
  lastProcessedAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Health Check
```http
GET /api/health
```
**Response**: Overall system health status

### Change Streams Status
```http
GET /api/health/change-streams
```
**Response**: 
```json
{
  "status": "success",
  "message": "Change Streams status retrieved",
  "data": {
    "enabled": true,
    "isWatching": true
  }
}
```

## Testing

### Test Script
Use the provided test script to verify the implementation:
```bash
# 1. Set environment variable
export ENABLE_CHANGE_STREAMS=true

# 2. Start the backend server
npm run dev

# 3. In another terminal, run the test
node test-change-streams.js
```

### What to Verify
1. **Backend Logs**: Look for Change Streams initialization messages
2. **Notification Processing**: Check for "Processed notification change" logs
3. **Socket.IO Emission**: Verify "Emitted notification to user" logs
4. **Frontend Reception**: Confirm real-time notification delivery

## Monitoring and Observability

### Logs
The service provides structured logging for:
- Service initialization and status changes
- Change stream events and processing
- Error conditions and recovery attempts
- Resume token operations

### Health Checks
- Real-time status via `/api/health/change-streams`
- Integration with overall system health monitoring

### Error Handling
- Automatic restart on connection failures
- Graceful degradation when Change Streams are unavailable
- Comprehensive error logging with context

## Performance Considerations

### Change Stream Pipeline
```typescript
const pipeline = [
  {
    $match: {
      operationType: 'insert',
      'fullDocument.type': { $exists: true }
    }
  }
];
```

**Optimizations**:
- Only watches `insert` operations
- Filters for valid notification documents
- Minimal payload processing

### Memory Usage
- Resume tokens are stored in a dedicated collection
- Automatic cleanup of old tokens (handled by MongoDB TTL)
- No in-memory buffering of changes

### Network Impact
- Changes are processed immediately
- No batching or queuing to minimize latency
- Socket.IO emissions are non-blocking

## Security

### Access Control
- No public endpoints for Change Streams operations
- Health endpoints are internal monitoring tools
- Resume token collection is isolated

### Data Validation
- All notifications are validated against the schema
- User ID validation before Socket.IO emission
- Error handling prevents data leakage

## Troubleshooting

### Common Issues

#### 1. Change Streams Not Starting
**Symptoms**: Service logs show "MongoDB is not running as a replica set"
**Solution**: Ensure MongoDB is configured as a replica set

#### 2. Missing Notifications
**Symptoms**: Notifications created but not received in real-time
**Solution**: Check Change Streams service status via health endpoint

#### 3. High Memory Usage
**Symptoms**: Memory consumption increases over time
**Solution**: Verify resume token cleanup is working correctly

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment:
```bash
export DEBUG=true
export ENABLE_CHANGE_STREAMS=true
npm run dev
```

## Rollback Plan

### Quick Disable
Set environment variable to disable the service:
```bash
export ENABLE_CHANGE_STREAMS=false
```
Restart the backend server.

### Code Rollback
If needed, the service can be completely removed by:
1. Removing the service import from `index.ts`
2. Deleting the service files
3. Removing health endpoints
4. Cleaning up environment variables

## Future Enhancements

### Planned Features
- **Update Events**: Watch for notification updates (read/unread status)
- **Delete Events**: Handle notification deletion
- **Bulk Operations**: Optimize for bulk notification inserts
- **Metrics**: Add performance metrics and monitoring

### Scalability Considerations
- **Horizontal Scaling**: Leader election for multiple backend instances
- **Load Balancing**: Distribute Change Streams across instances
- **Caching**: Redis-based caching for high-frequency notifications

## Support

For issues or questions:
1. Check the health endpoints for service status
2. Review backend logs for error details
3. Verify MongoDB replica set configuration
4. Test with the provided test script

## Changelog

### v1.0.0 (Current)
- Initial implementation of Change Streams service
- Feature flag control via environment variable
- Resume token persistence
- Health monitoring endpoints
- Comprehensive error handling and logging
- Graceful shutdown support
