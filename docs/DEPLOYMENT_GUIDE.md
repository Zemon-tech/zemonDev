# Change Streams Deployment Guide

## Prerequisites

### MongoDB Configuration
1. **Replica Set Setup**: MongoDB must be running as a replica set
   ```bash
   # Example replica set configuration
   mongod --replSet rs0 --port 27017
   ```

2. **Database User Permissions**: Ensure the database user has `changeStream` capability
   ```javascript
   // In MongoDB shell
   db.grantRolesToUser("your_user", [
     { role: "readWrite", db: "your_database" },
     { role: "changeStream", db: "your_database" }
   ])
   ```

### Environment Variables
Set the required environment variable:
```bash
export ENABLE_CHANGE_STREAMS=true
```

## Deployment Steps

### 1. Development Environment
```bash
# Clone and setup
cd backend
npm install

# Set environment variable
export ENABLE_CHANGE_STREAMS=true

# Start development server
npm run dev
```

### 2. Production Environment
```bash
# Build the application
npm run build

# Set environment variables
export ENABLE_CHANGE_STREAMS=true
export NODE_ENV=production

# Start production server
npm start
```

### 3. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Environment variables
ENV ENABLE_CHANGE_STREAMS=true
ENV NODE_ENV=production

EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - ENABLE_CHANGE_STREAMS=true
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/zemon
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    command: mongod --replSet rs0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

## Verification

### 1. Health Check
```bash
# Check overall health
curl http://localhost:5000/api/health

# Check Change Streams status
curl http://localhost:5000/api/health/change-streams
```

### 2. Test Real-time Notifications
```bash
# Run the test script
node test-change-streams.js

# Check backend logs for:
# - "Change Streams service initialized successfully"
# - "Processed notification change"
# - "Emitted notification to user via Socket.IO"
```

### 3. Frontend Testing
1. Open the user frontend
2. Connect to the backend via Socket.IO
3. Create a notification via admin backend
4. Verify real-time delivery in the frontend

## Monitoring

### Logs to Watch
- **Startup**: "Change Streams service initialized successfully"
- **Activity**: "Processed notification change"
- **Errors**: "Change Streams error" or "Failed to emit notification"
- **Recovery**: "Resuming Change Streams from saved token"

### Health Endpoints
- `GET /api/health` - Overall system status
- `GET /api/health/change-streams` - Service-specific status

### Metrics to Monitor
- Change Streams connection status
- Notification processing rate
- Error frequency and types
- Resume token operations

## Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check MongoDB replica set status
mongo --eval "rs.status()"

# Verify environment variable
echo $ENABLE_CHANGE_STREAMS

# Check backend logs for error messages
```

#### 2. Notifications Not Delivered
```bash
# Check service status
curl http://localhost:5000/api/health/change-streams

# Verify MongoDB connection
# Check for Change Streams errors in logs
```

#### 3. High Resource Usage
```bash
# Monitor memory usage
ps aux | grep node

# Check MongoDB oplog size
mongo --eval "db.oplog.rs.stats()"
```

### Debug Mode
Enable detailed logging:
```bash
export DEBUG=true
export ENABLE_CHANGE_STREAMS=true
npm run dev
```

## Rollback Plan

### Quick Disable
```bash
export ENABLE_CHANGE_STREAMS=false
# Restart backend service
```

### Complete Removal
1. Stop the backend service
2. Remove Change Streams imports from `index.ts`
3. Delete service files
4. Remove health endpoints
5. Clean up environment variables
6. Restart service

## Security Considerations

### Network Security
- Health endpoints are internal monitoring tools
- No public Change Streams operations
- Resume token collection is isolated

### Database Security
- Use least-privilege database users
- Enable MongoDB authentication
- Restrict network access to MongoDB

### Environment Security
- Store sensitive environment variables securely
- Use secrets management in production
- Rotate database credentials regularly

## Performance Tuning

### MongoDB Optimization
```javascript
// Optimize oplog size for Change Streams
db.adminCommand({
  replSetResizeOplog: 1,
  size: 1024 * 1024 * 1024 // 1GB
})
```

### Application Tuning
- Monitor Change Streams pipeline performance
- Adjust resume token storage strategy
- Optimize Socket.IO emission logic

## Support and Maintenance

### Regular Checks
- Monitor Change Streams connection status
- Verify resume token cleanup
- Check error logs for patterns

### Updates
- Keep MongoDB drivers updated
- Monitor for Change Streams improvements
- Update resume token handling as needed

### Backup Considerations
- Resume tokens are not critical for data integrity
- Include in regular database backups
- Monitor collection size and cleanup
