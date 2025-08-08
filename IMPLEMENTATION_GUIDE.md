# Nginx Conditional Routing Implementation Guide

## Overview

This guide explains how to implement a conditional routing system using Nginx that serves different applications based on user authentication status. The system routes users to either a landing page or a main application based on the presence of an authentication cookie.

## What We've Built

### Architecture
```
Internet → Nginx (Port 80/443) → Conditional Routing
                                    ├── No auth_token → Next.js Landing (Port 3000)
                                    ├── Has auth_token → MERN Frontend (Port 5173)
                                    └── /api/* → Express Backend (Port 3001)
```

### Components
1. **Nginx Reverse Proxy**: Main entry point handling all incoming requests
2. **Next.js Landing Site**: Marketing/landing page for unauthenticated users
3. **MERN Frontend**: Main application for authenticated users
4. **Express Backend**: API server handling all backend operations

## How the Routing Logic Works

### Cookie-Based Authentication Check
The Nginx configuration uses the following logic:

```nginx
# Check if auth_token cookie exists
if ($http_cookie ~* "auth_token") {
    set $upstream "mern_frontend";  # Route to main app
}

# Default to landing site if no auth_token cookie
if ($upstream = "") {
    set $upstream "landing_site";   # Route to landing page
}
```

### Request Flow
1. **User visits example.com**
2. **Nginx checks for `auth_token` cookie**
3. **If cookie exists**: Routes to MERN frontend (port 3001)
4. **If no cookie**: Routes to Next.js landing (port 3000)
5. **API requests (/api/*)**: Always routed to Express backend (port 5000)

## Step-by-Step Implementation

### 1. Server Setup

#### Prerequisites
- Ubuntu 20.04+ server
- Root or sudo access
- Domain name pointing to your server

#### Install Nginx
```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Application Setup

#### Start Your Applications
Make sure all your applications are running:

```bash
# Terminal 1: Next.js Landing Site
cd /path/to/landing-site
npm run dev  # Runs on port 3000

# Terminal 2: MERN Frontend
cd /path/to/mern-frontend
npm run dev  # Runs on port 5173 (Vite default)

# Terminal 3: Express Backend
cd /path/to/express-backend
npm start    # Runs on port 3001
```

#### Verify Applications Are Running
```bash
curl http://localhost:3000  # Should return landing page
curl http://localhost:5173  # Should return MERN app
curl http://localhost:3001/api/health  # Should return API response
```

### 3. Nginx Configuration Deployment

#### Copy Configuration File
```bash
sudo cp nginx.conf /etc/nginx/sites-available/example.com
```

#### Edit Domain Name
```bash
sudo nano /etc/nginx/sites-available/example.com
```
Replace `example.com` with your actual domain name in the `server_name` directive.

#### Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

#### Test Configuration
```bash
sudo nginx -t
```

#### Reload Nginx
```bash
sudo systemctl reload nginx
```

### 4. Backend Authentication Setup

#### Cookie Configuration
Ensure your Express backend sets the `auth_token` cookie properly:

```javascript
// In your login route
app.post('/api/login', async (req, res) => {
    // ... authentication logic ...
    
    // Set the auth_token cookie
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ success: true });
});

// In your logout route
app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});
```

#### CORS Configuration
Configure CORS in your Express backend:

```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://example.com' 
        : 'http://localhost:3001',
    credentials: true
}));
```

### 5. Frontend Configuration

#### API Base URL
Update your frontend applications to use the correct API base URL:

```javascript
// In your frontend API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://example.com/api' 
    : 'http://localhost:3001/api';
```

#### Cookie Handling
Ensure your frontend includes credentials in API requests:

```javascript
// For fetch requests
fetch('/api/user', {
    credentials: 'include'
});

// For axios
axios.defaults.withCredentials = true;
```

### 6. Testing the Implementation

#### Test Unauthenticated Access
```bash
curl -I http://example.com
# Should show landing page headers
```

#### Test Authenticated Access
```bash
# First, get a cookie by logging in
curl -c cookies.txt -X POST http://example.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then access the site with the cookie
curl -b cookies.txt http://example.com
# Should show MERN app headers
```

#### Test API Access
```bash
curl http://example.com/api/health
# Should return API response
```

### 7. Production Considerations

#### SSL/HTTPS Setup
1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d example.com -d www.example.com
   ```

3. **Uncomment HTTPS configuration** in the nginx.conf file

#### Environment Variables
Set up proper environment variables for production:

```bash
# In your applications
NODE_ENV=production
DOMAIN=example.com
```

#### Process Management
Use PM2 to manage your Node.js applications:

```bash
npm install -g pm2

# Start applications
pm2 start npm --name "landing" -- run dev
pm2 start npm --name "frontend" -- start
pm2 start npm --name "backend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Troubleshooting

### Common Issues

#### 1. Nginx Configuration Test Fails
```bash
sudo nginx -t
# Check for syntax errors and fix them
```

#### 2. Applications Not Accessible
```bash
# Check if applications are running
netstat -tlnp | grep :3000
netstat -tlnp | grep :5173
netstat -tlnp | grep :3001

# Check firewall settings
sudo ufw status
```

#### 3. Cookie Not Being Set
- Verify `httpOnly: false` for development
- Check `secure: false` for HTTP
- Ensure `sameSite: 'lax'` or `'none'`

#### 4. CORS Errors
- Verify CORS configuration in backend
- Check `credentials: true` in frontend requests
- Ensure proper origin configuration

### Debugging Commands

#### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/example.com.access.log
sudo tail -f /var/log/nginx/example.com.error.log
```

#### Check Application Logs
```bash
# If using PM2
pm2 logs

# Or check individual application logs
tail -f /path/to/app/logs/app.log
```

#### Test Cookie Presence
```bash
# Check what cookies are being sent
curl -v http://example.com 2>&1 | grep -i cookie
```

## Security Considerations

### 1. Cookie Security
- Use `httpOnly: true` in production
- Use `secure: true` with HTTPS
- Set appropriate `sameSite` policy

### 2. Rate Limiting
Add rate limiting to your Nginx configuration:

```nginx
# Add to server block
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... existing configuration
}
```

### 3. Security Headers
The configuration already includes basic security headers. Consider adding:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

## Monitoring and Maintenance

### 1. Health Checks
The configuration includes a health check endpoint:
```bash
curl http://example.com/health
```

### 2. Log Rotation
Configure log rotation for Nginx:
```bash
sudo nano /etc/logrotate.d/nginx
```

### 3. Performance Monitoring
Monitor server performance:
```bash
htop
df -h
free -h
```

## Conclusion

This implementation provides a robust, scalable solution for serving different applications based on user authentication status. The Nginx configuration handles all the routing logic transparently, while your applications focus on their core functionality.

Remember to:
- Test thoroughly in a staging environment
- Monitor logs and performance
- Keep applications and Nginx updated
- Implement proper backup strategies
- Consider using a CDN for static assets in production

The system is now ready to handle your conditional routing requirements efficiently and securely.
