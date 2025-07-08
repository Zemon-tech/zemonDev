# Gemini Chat Implementation Plan

## Overview
This document outlines the plan for implementing AI chat functionality using Google's Gemini 2.5 model in the ZEMON platform.

## Current Architecture
- MongoDB for storing chat history and messages
- Express.js backend with TypeScript
- Existing AI chat routes and controllers
- Rate limiting middleware for AI endpoints

## Phase 1: Basic Chat Implementation

### 1. Environment Setup
```bash
# Add to .env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-pro
```

### 2. Dependencies
```bash
npm install @google/generative-ai
```

### 3. Service Implementation (ai.service.ts)
- Create chat completion function using Gemini API
- Handle message history and context
- Implement error handling and retries
- Format responses consistently

### 4. Database Model (Already Implemented)
Using existing `AIChatHistory` model with schema:
- userId: ObjectId
- problemId: ObjectId
- title: string
- messages: Array of {role, content, timestamp}
- status: 'active' | 'archived'

### 5. Controller Updates (aiChat.controller.ts)
- Update `addChatMessage` to integrate with Gemini
- Add message validation
- Implement proper error handling
- Add context management

### 6. API Routes (Already Implemented)
Using existing routes:
- GET /api/crucible/:problemId/chats
- POST /api/crucible/:problemId/chats
- GET /api/crucible/:problemId/chats/:chatId
- POST /api/crucible/:problemId/chats/:chatId/messages
- PUT /api/crucible/:problemId/chats/:chatId
- DELETE /api/crucible/:problemId/chats/:chatId

## Implementation Details

### 1. AI Service Updates

```typescript
// src/services/ai.service.ts

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  error?: string;
}

async function generateChatResponse(
  messages: ChatMessage[],
  problemContext?: ICrucibleProblem
): Promise<ChatResponse>
```

### 2. Controller Integration

```typescript
// src/controllers/aiChat.controller.ts

async function addChatMessage(req, res) {
  // 1. Validate input
  // 2. Get chat history
  // 3. Call Gemini API
  // 4. Save response
  // 5. Return updated chat
}
```

### 3. Error Handling
- API errors (rate limits, timeouts)
- Invalid responses
- Context length exceeded
- Token limits

### 4. Performance Considerations
- Message history truncation
- Response streaming
- Rate limiting
- Error recovery

## Next Steps

1. Implement basic chat functionality
2. Test with various scenarios
3. Add error handling
4. Monitor performance
5. Gather feedback
6. Plan next phase (analysis features)

## Future Phases

### Phase 2: Enhanced Features
- Solution analysis
- Code review
- Learning path suggestions
- Progress tracking

### Phase 3: Advanced Features
- Multi-modal support (code + text)
- Personalized responses
- Learning style adaptation 