# Local Testing Guide - No Domain Required

## Quick Setup for Local Testing

### 1. **Install Nginx (if not already installed)**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# macOS (using Homebrew)
brew install nginx

# Start Nginx
sudo systemctl start nginx  # Linux
brew services start nginx   # macOS
```

### 2. **Start Your Applications**
Open 3 terminal windows and run:

```bash
# Terminal 1: Landing Site (Port 3000)
cd /path/to/your/landing-site
npm run dev

# Terminal 2: MERN Frontend (Port 5173)
cd /path/to/your/mern-frontend
npm run dev

# Terminal 3: Express Backend (Port 3001)
cd /path/to/your/express-backend
npm start
```

### 3. **Deploy Nginx Configuration**

#### For Ubuntu/Debian:
```bash
# Copy the configuration
sudo cp nginx.conf /etc/nginx/sites-available/localhost

# Enable the site
sudo ln -s /etc/nginx/sites-available/localhost /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### For macOS:
```bash
# Copy the configuration to Nginx directory
sudo cp nginx.conf /usr/local/etc/nginx/servers/localhost.conf

# Edit main nginx.conf to include the server
sudo nano /usr/local/etc/nginx/nginx.conf

# Add this line in the http block:
# include /usr/local/etc/nginx/servers/*.conf;

# Test and reload
sudo nginx -t
sudo nginx -s reload
```

### 4. **Test Your Setup**

#### Test Individual Applications:
```bash
# Test landing site
curl http://localhost:3000

# Test MERN frontend
curl http://localhost:5173

# Test backend API
curl http://localhost:3001/api/health
```

#### Test Nginx Routing:
```bash
# Test without authentication (should show landing page)
curl -I http://localhost

# Test with authentication (should show MERN app)
curl -c cookies.txt -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

curl -b cookies.txt http://localhost
```

### 5. **Update Your Frontend Configuration**

Make sure your frontend applications are configured to use the correct API endpoints:

#### For Development:
```javascript
// In your frontend API configuration
const API_BASE_URL = 'http://localhost:3001/api';
```

#### For Production (when you get a domain):
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api' 
    : 'http://localhost:3001/api';
```

### 6. **Backend CORS Configuration**

Update your Express backend CORS settings:

```javascript
const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
```

### 7. **Cookie Configuration for Local Testing**

In your backend login route, ensure cookies work for localhost:

```javascript
app.post('/api/login', async (req, res) => {
    // ... authentication logic ...
    
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: false,  // Set to false for HTTP localhost
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ success: true });
});
```

## Testing Scenarios

### Scenario 1: Unauthenticated User
1. Open browser to `http://localhost`
2. Should see landing page (from port 3000)
3. No `auth_token` cookie present

### Scenario 2: Authenticated User
1. Login via API: `POST http://localhost/api/login`
2. `auth_token` cookie gets set
3. Visit `http://localhost` again
4. Should see MERN app (from port 5173)

### Scenario 3: API Access
1. Any request to `http://localhost/api/*`
2. Should be routed to backend (port 3001)

## Troubleshooting

### Common Issues:

#### 1. "Permission Denied" on Port 80
```bash
# Use a different port for testing
sudo nano nginx.conf
# Change: listen 80; to: listen 8080;
# Then access via http://localhost:8080
```

#### 2. Applications Not Starting
```bash
# Check if ports are already in use
netstat -tlnp | grep :3000
netstat -tlnp | grep :5173
netstat -tlnp | grep :3001

# Kill processes if needed
sudo kill -9 <PID>
```

#### 3. Nginx Configuration Errors
```bash
# Check Nginx syntax
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Cookie Not Working
- Ensure `secure: false` for HTTP localhost
- Check browser developer tools for cookie presence
- Verify CORS settings include credentials

## Browser Testing

1. **Open Developer Tools** (F12)
2. **Go to Application/Storage tab**
3. **Check Cookies** for `localhost`
4. **Test login flow** and verify cookie appears
5. **Refresh page** and verify routing changes

## Next Steps

Once local testing works:
1. Get a domain name
2. Update `server_name` in nginx.conf
3. Set up SSL certificates
4. Update CORS origins to your domain
5. Set `secure: true` for cookies

Your local setup is now ready for testing! 🚀







