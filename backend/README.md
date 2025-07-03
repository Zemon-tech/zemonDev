# ZEMON Backend

The backend for the ZEMON educational platform for engineering students.

## Technologies

- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- Upstash Redis for caching
- Clerk for authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Upstash Redis account
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://your-repository-url.git
cd zemonDev/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your credentials.

4. Start development server:
```bash
npm run dev
```

5. For production build:
```bash
npm run build
npm start
```

## API Documentation

### Authentication

Authentication is handled by Clerk. Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

### Routes

#### User Routes

- `POST /api/webhooks/clerk` - Clerk webhook handler
- `GET /api/users/me` - Get current user (protected)
- `PATCH /api/users/me` - Update current user (protected)

#### Crucible Routes (Challenges)

- `GET /api/crucible` - Get all challenges
- `GET /api/crucible/:id` - Get a specific challenge
- `POST /api/crucible` - Create a challenge (protected)
- `GET /api/crucible/:challengeId/solutions` - Get solutions for a challenge
- `POST /api/crucible/:challengeId/solutions` - Submit a solution (protected)

#### Forge Routes (Resources)

- `GET /api/forge` - Get all resources
- `GET /api/forge/:id` - Get a specific resource
- `POST /api/forge` - Create a resource (protected)
- `POST /api/forge/:id/bookmark` - Bookmark a resource (protected)
- `POST /api/forge/:id/review` - Review a resource (protected)

#### AI Routes

- `POST /api/ai/ask` - Ask the AI assistant (protected)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linting 