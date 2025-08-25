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

## Docker

### Build & run with Docker directly

```bash
# From repo root or backend folder
docker build -t zemon-backend ./backend
docker run --rm -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/zemon \
  -e CORS_ORIGIN=http://localhost:5173 \
  -e CLERK_SECRET_KEY=your_key \
  -e CLERK_JWT_KEY=your_key \
  -e CLERK_ISSUER=your_issuer \
  -e UPSTASH_REDIS_REST_URL=... \
  -e UPSTASH_REDIS_REST_TOKEN=... \
  -e UPSTASH_VECTOR_REST_URL=... \
  -e UPSTASH_VECTOR_REST_TOKEN=... \
  -e GEMINI_API_KEY=... \
  -e GEMINI_PRO_API_KEY=... \
  -e SERPAPI_KEY=... \
  zemon-backend
```

### docker-compose (with MongoDB)

At repo root, we provide `docker-compose.yml`.

1) Create a `.env` file at repo root with secrets:

```
CLERK_SECRET_KEY=...
CLERK_JWT_KEY=...
CLERK_ISSUER=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_VECTOR_REST_URL=...
UPSTASH_VECTOR_REST_TOKEN=...
GEMINI_API_KEY=...
GEMINI_PRO_API_KEY=...
SERPAPI_KEY=...
```

2) Start services:

```bash
docker compose up --build
```

Backend will be available at `http://localhost:5000` and MongoDB at `mongodb://localhost:27017`.

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

## Database Migrations

Occasionally, you may need to run database migrations to update the schema or data. These migrations are located in the `src/migrations` directory.

To run a specific migration:

```bash
npx ts-node src/migrations/[migration-file-name].ts
```

### Available Migrations

- `remove-status-visibility-crucible-notes.ts` - Removes the status and visibility fields from CrucibleNote documents 

## Features

- **Real-time Notifications**: MongoDB Change Streams for instant notification delivery
- **WebSocket Support**: Socket.IO for real-time communication
- **Authentication**: Clerk-based user authentication
- **AI Integration**: Gemini AI assistant for user queries
- **Caching**: Redis-based caching for improved performance
- **Vector Search**: Upstash Vector for semantic search capabilities

## Real-time Notifications

The backend includes a MongoDB Change Streams service that provides real-time notifications when admin-created notifications are inserted into the database.

### Configuration
Enable real-time notifications by setting the environment variable:
```bash
export ENABLE_CHANGE_STREAMS=true
```

### Requirements
- MongoDB must be running as a replica set
- Database user must have `changeStream` capability

### Testing
Use the provided test script to verify the implementation:
```bash
node test-change-streams.js
```

### Monitoring
Check the service status via the health endpoint:
```bash
curl http://localhost:5000/api/health/change-streams
```

For detailed documentation, see [docs/CHANGE_STREAMS_IMPLEMENTATION.md](../docs/CHANGE_STREAMS_IMPLEMENTATION.md). 