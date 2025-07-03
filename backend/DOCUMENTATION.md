# ZEMON Backend Documentation

This document provides a comprehensive overview of the ZEMON backend architecture, components, and API endpoints. It is intended for developers working on or integrating with the backend system.

## Table of Contents

1.  [High-Level Overview](#1-high-level-overview)
2.  [Technology Stack](#2-technology-stack)
3.  [Project Structure](#3-project-structure)
4.  [Environment Variables](#4-environment-variables)
5.  [Authentication Flow](#5-authentication-flow)
6.  [Core Middleware](#6-core-middleware)
7.  [API Endpoints](#7-api-endpoints)
    -   [Users API](#users-api)
    -   [Crucible (Problems & Solutions) API](#crucible-problems--solutions-api)
    -   [Forge (Resources) API](#forge-resources-api)
    -   [AI Services API](#ai-services-api)
8.  [Controllers](#8-controllers)
9.  [Services](#9-services)
10. [Database Models](#10-database-models)
11. [Getting Started](#11-getting-started)

---

## 1. High-Level Overview

The ZEMON backend is a Node.js application built with Express and TypeScript. It serves as the core API for the ZEMON educational platform, managing users, problems, solutions, and community resources. It leverages a monolithic architecture with a service-oriented approach to encapsulate business logic. Key features include Clerk-based authentication, MongoDB for data persistence, Upstash Redis for caching, and Google Gemini for AI-powered code analysis and hint generation.

## 2. Technology Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: Clerk
-   **Caching**: Upstash Redis
-   **AI Services**: Google Gemini Pro
-   **Dev Toolkit**: `ts-node-dev` for live reloading, `eslint` for linting

## 3. Project Structure

The backend follows a feature-oriented directory structure designed for scalability and maintainability.

```
/backend
|-- /dist/                # Compiled JavaScript output
|-- /node_modules/        # Project dependencies
|-- /src/
|   |-- /api/             # Route definitions for each feature
|   |-- /config/          # Database, environment, and Redis configurations
|   |-- /controllers/     # Request handlers (logic between routes and services)
|   |-- /middleware/      # Custom middleware (auth, error handling, caching)
|   |-- /models/          # Mongoose schemas and TypeScript interfaces
|   |-- /services/        # Business logic (e.g., AI interactions)
|   |-- /utils/           # Helper classes and functions (ApiResponse, asyncHandler)
|   |-- index.ts          # Main application entry point
|-- .env                  # Local environment variables (not committed)
|-- .env.example          # Template for environment variables
|-- .gitignore            # Git ignore rules
|-- DOCUMENTATION.md      # This file
|-- package.json          # Project metadata and dependencies
|-- tsconfig.json         # TypeScript compiler options
```

## 4. Environment Variables

The application requires the following environment variables, defined in a `.env` file at the root of the `/backend` directory.

| Variable                   | Description                                          | Example                                       |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `PORT`                     | The port the server will run on.                     | `5000`                                        |
| `NODE_ENV`                 | The application environment.                         | `development` or `production`                 |
| `CORS_ORIGIN`              | The frontend URL for CORS policy.                    | `http://localhost:5173`                       |
| `MONGO_URI`                | Connection string for your MongoDB database.         | `mongodb+srv://...`                           |
| `UPSTASH_REDIS_REST_URL`   | The REST URL for your Upstash Redis instance.        | `https://your-instance.upstash.io`            |
| `UPSTASH_REDIS_REST_TOKEN` | The access token for your Upstash Redis instance.    | `A...`                                        |
| `CLERK_SECRET_KEY`         | Your secret key from the Clerk dashboard.            | `sk_...`                                      |
| `GEMINI_API_KEY`           | Your API key for the Google Gemini service.          | `AI...`                                       |
| `CACHE_ENABLED`            | Set to `true` to enable Redis caching.               | `true`                                        |

## 5. Authentication Flow

Authentication is managed by [Clerk](https://clerk.com/).

1.  **Frontend**: The frontend uses Clerk's components to handle user sign-up and sign-in.
2.  **JWT Token**: After a successful login, Clerk issues a short-lived JSON Web Token (JWT) to the client.
3.  **API Requests**: The frontend attaches this JWT to the `Authorization: Bearer <token>` header for all requests to protected backend endpoints.
4.  **Backend Middleware**: The `protect` middleware (`src/middleware/auth.middleware.ts`) intercepts these requests. It uses the `@clerk/clerk-sdk-node` package to verify the token's validity.
5.  **User Hydration**: If the token is valid, the middleware extracts the `clerkId` from the token payload, fetches the corresponding user from the MongoDB `User` collection, and attaches the user document to the `req.user` object for use in downstream controllers.

A Clerk webhook (`/api/users/webhooks/clerk`) listens for `user.created` and `user.updated` events to keep the local MongoDB user database in sync with Clerk's user records.

## 6. Core Middleware

-   **`auth.middleware.ts`**: Contains the `protect` middleware for securing routes.
-   **`error.middleware.ts`**: A global error handler that catches all errors passed via `next()` and formats them into a standardized JSON response.
-   **`cache.middleware.ts`**: Implements Redis caching for `GET` requests. It uses the request URL as the cache key and has a configurable Time-To-Live (TTL).
-   **`rateLimiter.middleware.ts`**: Provides rate limiting to prevent API abuse, with different configurations for standard endpoints and stricter limits for AI-related endpoints.

## 7. API Endpoints

All endpoints are prefixed with `/api`.

### Users API

-   **Controller**: `src/controllers/user.controller.ts`
-   **Routes**: `src/api/user.routes.ts`

| Method | Endpoint                  | Access    | Description                                                  |
| ------ | ------------------------- | --------- | ------------------------------------------------------------ |
| `POST` | `/users/webhooks/clerk`   | Public    | Handles user creation/update events from Clerk.              |
| `GET`  | `/users/me`               | Private   | Retrieves the complete profile of the logged-in user.        |
| `PATCH`| `/users/me`               | Private   | Updates the profile details of the logged-in user.           |

### Crucible (Problems & Solutions) API

-   **Controller**: `src/controllers/crucible.controller.ts`
-   **Routes**: `src/api/crucible.routes.ts`

| Method | Endpoint                              | Access    | Description                                                  |
| ------ | ------------------------------------- | --------- | ------------------------------------------------------------ |
| `GET`  | `/crucible`                           | Public    | Lists all problems with pagination and filtering.            |
| `POST` | `/crucible`                           | Private   | Creates a new problem.                                       |
| `GET`  | `/crucible/:id`                       | Public    | Retrieves a single problem by its ID.                        |
| `GET`  | `/crucible/:challengeId/solutions`    | Public    | Lists all solutions for a specific problem.                  |
| `POST` | `/crucible/:challengeId/solutions`    | Private   | Submits a new solution for a specific problem.               |

### Forge (Resources) API

-   **Controller**: `src/controllers/forge.controller.ts`
-   **Routes**: `src/api/forge.routes.ts`

| Method | Endpoint                  | Access    | Description                                                  |
| ------ | ------------------------- | --------- | ------------------------------------------------------------ |
| `GET`  | `/forge`                  | Public    | Lists all resources with pagination and filtering.           |
| `POST` | `/forge`                  | Private   | Creates a new resource.                                      |
| `GET`  | `/forge/:id`              | Public    | Retrieves a single resource and increments its view count.   |
| `POST` | `/forge/:id/bookmark`     | Private   | Toggles a bookmark on a resource for the logged-in user.     |
| `POST` | `/forge/:id/review`       | Private   | Submits or updates a rating and review for a resource.       |

### AI Services API

-   **Controller**: `src/controllers/ai.controller.ts`
-   **Routes**: `src/api/ai.routes.ts`

| Method | Endpoint                   | Access    | Description                                                  |
| ------ | -------------------------- | --------- | ------------------------------------------------------------ |
| `POST` | `/ai/analyze-solution`     | Private   | Submits a solution to be analyzed by the Gemini AI service.  |
| `POST` | `/ai/generate-hints`       | Private   | Requests a set of hints for a specific problem.              |
| `POST` | `/ai/ask`                  | Private   | Placeholder endpoint for a general-purpose AI assistant.     |

## 8. Controllers

Controllers act as the glue between the API routes and the underlying services/models. Each controller in `src/controllers/` is responsible for:
-   Extracting data from the request body, params, and query.
-   Calling services or interacting with Mongoose models to perform business logic.
-   Handling the request-response cycle and sending a standardized `ApiResponse`.
-   Passing errors to the global error handler via `next()`.

## 9. Services

The `src/services/` directory contains modules that encapsulate complex, third-party, or reusable business logic.

-   **`ai.service.ts`**: This service is the single point of interaction with the Google Gemini API. It is responsible for:
    -   Initializing the Gemini client with the API key.
    -   Constructing detailed prompts for solution analysis and hint generation.
    -   Calling the Gemini model to generate content.
    -   Safely parsing the JSON response from the AI and handling potential errors gracefully.

## 10. Database Models

Mongoose schemas and TypeScript interfaces are defined in `src/models/`. They represent the structure of the data stored in MongoDB.

-   **`user.model.ts`**: Stores user profile information, stats, and references to their bookmarked resources and submitted solutions.
-   **`crucibleProblem.model.ts`**: Defines the structure for a programming challenge, including its description, requirements, and metadata.
-   **`crucibleSolution.model.ts`**: Stores a user's solution to a problem, along with AI analysis and community reviews.
-   **`forgeResource.model.ts`**: Represents a community-submitted resource, such as an article, video, or tool.

## 11. Getting Started

1.  **Clone the repository.**
2.  Navigate to the `/backend` directory: `cd backend`.
3.  Install dependencies: `npm install`.
4.  Create a `.env` file from the example: `cp .env.example .env`.
5.  Fill in your credentials in the `.env` file.
6.  Start the development server: `npm run dev`.
7.  The API will be available at `http://localhost:5000` (or the port specified in your `.env`). 