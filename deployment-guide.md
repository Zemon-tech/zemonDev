# Deployment Guide for Zemon Project

## Overview of Localhost References

After scanning the codebase, here are the localhost references that need to be updated for deployment:

### Frontend (Vercel)

1. **Environment Variables**
   - Create a `.env.production` file in the frontend directory with:
   ```
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

2. **Socket Connection**
   - The socket connection in `frontend/src/services/socket.service.ts` uses `import.meta.env.VITE_BACKEND_URL`
   - This will be automatically updated when the environment variable is set

3. **API Endpoints**
   - All API endpoints use either:
     - `import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'`
     - `import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'`
   - These will be automatically updated when the environment variables are set

4. **Vite Configuration**
   - `frontend/vite.config.ts` contains a development proxy configuration:
   ```js
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
         secure: false,
       },
     },
   },
   ```
   - This is only used during development and won't affect production deployment

### Backend (Render)

1. **Environment Variables**
   - Set the following environment variables in your Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000 (or let Render assign one automatically)
   MONGO_URI=your-mongodb-connection-string
   UPSTASH_REDIS_REST_URL=your-upstash-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
   UPSTASH_VECTOR_REST_URL=your-upstash-vector-url
   UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_PRO_API_KEY=your-gemini-pro-api-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ENABLE_CHANGE_STREAMS=true (if needed)
   ```

2. **CORS Configuration**
   - Update the CORS configuration in `backend/src/index.ts`:
   ```js
   app.use(
     cors({
       origin: [
         process.env.CORS_ORIGIN || 'http://localhost:5173',
         // Remove this line or replace with another allowed origin if needed
         'http://localhost:5175'
       ],
       credentials: true,
     })
   );
   ```

3. **Socket Service**
   - Update the CORS configuration in `backend/src/services/socket.service.ts`:
   ```js
   const corsOptions = {
     origin: [
       process.env.CORS_ORIGIN || 'http://localhost:5173',
       // Remove this line or replace with another allowed origin if needed
       'http://localhost:5175'
     ],
     credentials: true,
   };
   ```

## Deployment Steps

### Frontend (Vercel)

1. Create a new project in Vercel and connect your repository
2. Set the following:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
3. Add the environment variables:
   - VITE_BACKEND_URL=https://your-backend-url.onrender.com
   - VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
4. Deploy the project

### Backend (Render)

1. Create a new Web Service in Render and connect your repository
2. Set the following:
   - Root Directory: backend
   - Build Command: npm install
   - Start Command: npm start
3. Add all the environment variables listed above
4. Deploy the service

## Post-Deployment Verification

After deploying both services, verify that:

1. The frontend can connect to the backend API
2. WebSocket connections are working properly
3. Authentication flows are functioning correctly
4. All features are working as expected

If you encounter any issues, check the logs in Vercel and Render dashboards for error messages.
