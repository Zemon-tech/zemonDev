# Deployment Guide for Vercel

This guide explains how to deploy your frontend to Vercel with proper authentication routing to your landing site.

## Prerequisites

- Your backend is deployed on Render
- Your landing site is deployed on Vercel
- Your frontend will be deployed on Vercel

## Environment Variables Setup

In your Vercel deployment dashboard, set these environment variables:

### Required Environment Variables

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Backend API URL
VITE_BACKEND_URL=https://your-backend.onrender.com

# Landing Site URL (where unauthenticated users will be redirected)
VITE_LANDING_URL=https://your-landing-site.vercel.app

# Environment
VITE_NODE_ENV=production
```

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Redeploy your project

## How It Works

### Authentication Flow

1. **User visits your frontend app**
2. **If authenticated (has Clerk session):**
   - User sees the main application
   - All protected routes are accessible
3. **If not authenticated:**
   - User is automatically redirected to your landing site
   - Landing site handles sign-up/sign-in
   - After authentication, user returns to main app

### Route Protection

- All routes under `/:username/*` are protected
- The `ProtectedRoute` component checks authentication
- Unauthenticated users are redirected to landing site
- Authenticated users can access all features

## Deployment Steps

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Set environment variables** (see above)
4. **Deploy**
5. **Test the authentication flow**

## Testing

1. **Visit your frontend app without authentication**
   - Should redirect to landing site
2. **Sign up/sign in on landing site**
   - Should redirect back to main app
3. **Test protected routes**
   - Should be accessible when authenticated

## Troubleshooting

### Common Issues

1. **Redirect loop**: Check that `VITE_LANDING_URL` is correct
2. **API calls failing**: Verify `VITE_BACKEND_URL` is correct
3. **Authentication not working**: Check Clerk publishable key

### Debug Mode

Add this to your environment variables for debugging:
```bash
VITE_DEBUG=true
```

## Security Notes

- All API calls are made to your Render backend
- Authentication is handled by Clerk
- Unauthenticated users cannot access protected routes
- Landing site handles public content and authentication

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.tsx    # Route protection
│   ├── hooks/
│   │   └── useAuthRedirect.ts        # Authentication hook
│   ├── utils/
│   │   └── authRedirect.ts           # Redirect utilities
│   └── App.tsx                       # Updated with protection
├── vercel.json                       # Vercel configuration
└── env.example                       # Environment variables template
```
