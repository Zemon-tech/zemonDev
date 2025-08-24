# Dynamic Content Reference Guide

This document provides a comprehensive reference for all dynamically created content types in the Zemon application.

## Table of Contents

1. [Crucible (Problem-Solving Platform)](#crucible)
2. [Forge (Learning Resources)](#forge)
3. [Arena (Community & Competition)](#arena)
4. [Nirvana (Social Feed)](#nirvana)
5. [User Management](#user-management)
6. [Notifications](#notifications)

---

## Crucible

### CrucibleProblem
**File:** `backend/src/models/crucibleProblem.model.ts`

**Key Fields:**
- `title` (string, required): Problem title
- `description` (string, required): Problem description
- `difficulty` (enum): 'easy' | 'medium' | 'hard' | 'expert'
- `category` (enum): 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend'
- `tags` (string[]): Problem tags
- `requirements` (object): functional & nonFunctional requirements
- `constraints` (string[]): Problem constraints
- `expectedOutcome` (string, required): Expected solution outcome
- `hints` (string[]): Problem hints
- `createdBy` (ObjectId): Creator
- `metrics` (object): attempts, solutions, successRate
- `estimatedTime` (number): Time in minutes
- `learningObjectives` (string[]): Learning goals
- `prerequisites` (array): Required knowledge
- `userPersona` (object): Target user
- `dataAssumptions` (string[]): Data assumptions
- `edgeCases` (string[]): Edge cases
- `relatedResources` (array): Related learning resources
- `subtasks` (string[]): Subtasks breakdown
- `communityTips` (array): Community tips
- `aiPrompts` (string[]): AI assistance prompts
- `technicalParameters` (string[]): Technical specs
- `status` (enum): 'draft' | 'published' | 'archived'

### CrucibleSolution
**File:** `backend/src/models/crucibleSolution.model.ts`

**Key Fields:**
- `problemId` (ObjectId): Reference to problem
- `userId` (ObjectId): Submitter
- `content` (string): Solution content
- `status` (enum): 'draft' | 'submitted' | 'reviewed'
- `aiAnalysis` (object): AI feedback and score
- `reviews` (array): User reviews
- `metrics` (object): upvotes, downvotes, views

### SolutionDraft
**File:** `backend/src/models/solutionDraft.model.ts`

**Key Fields:**
- `userId` (ObjectId): Owner
- `problemId` (ObjectId): Reference to problem
- `currentContent` (string): Draft content
- `status` (enum): 'active' | 'archived'
- `lastEdited` (Date): Last edit time
- `autoSaveEnabled` (boolean): Auto-save status

### CrucibleNote
**File:** `backend/src/models/crucibleNote.model.ts`

**Key Fields:**
- `userId` (ObjectId): Owner
- `problemId` (ObjectId): Reference to problem
- `content` (string): Note content
- `tags` (string[]): Note tags
- `status` (enum): 'active' | 'archived'

### CrucibleDiagram
**File:** `backend/src/models/crucibleDiagram.model.ts`

**Key Fields:**
- `userId` (ObjectId): Creator
- `problemId` (ObjectId): Reference to problem
- `title` (string): Diagram title
- `type` (enum): 'architecture' | 'flowchart' | 'er-diagram' | 'sequence' | 'other'
- `content` (string): Diagram data
- `thumbnail` (string): Thumbnail URL
- `status` (enum): 'active' | 'archived'

---

## Forge

### ForgeResource
**File:** `backend/src/models/forgeResource.model.ts`

**Key Fields:**
- `title` (string, required): Resource title
- `type` (enum): 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation'
- `url` (string): External URL
- `description` (string, required): Resource description
- `content` (string): Internal content
- `contentType` (enum): 'markdown' | 'html'
- `thumbnail` (string): Thumbnail URL
- `tags` (string[]): Resource tags
- `difficulty` (enum): 'beginner' | 'intermediate' | 'advanced'
- `createdBy` (ObjectId): Creator
- `reviews` (array): User reviews
- `metrics` (object): views, bookmarks, rating
- `isExternal` (boolean): External resource flag

### ForgeProgress
**File:** `backend/src/models/forgeProgress.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `resourceId` (ObjectId): Reference to resource
- `progress` (number): Progress percentage (0-100)
- `completedAt` (Date): Completion time
- `lastAccessed` (Date): Last access time

---

## Arena

### ArenaChannel
**File:** `backend/src/models/arenaChannel.model.ts`

**Key Fields:**
- `name` (string, required): Channel name
- `type` (enum): 'chat' | 'announcement' | 'showcase' | 'info'
- `group` (enum): 'getting-started' | 'community' | 'hackathons'
- `description` (string): Channel description
- `isActive` (boolean): Active status
- `createdBy` (ObjectId): Creator
- `moderators` (ObjectId[]): Moderators
- `permissions` (object): canMessage, canRead
- `parentChannelId` (ObjectId): Parent channel

### ArenaMessage
**File:** `backend/src/models/arenaMessage.model.ts`

**Key Fields:**
- `channelId` (ObjectId): Channel reference
- `userId` (ObjectId): Author
- `username` (string): Author username
- `content` (string): Message content
- `type` (enum): 'text' | 'system'
- `replyToId` (ObjectId): Reply to message
- `mentions` (ObjectId[]): Mentioned users
- `timestamp` (Date): Message time
- `isEdited` (boolean): Edit status
- `isDeleted` (boolean): Deletion status

### UserChannelStatus
**File:** `backend/src/models/userChannelStatus.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `channelId` (ObjectId): Channel reference
- `lastReadMessageId` (ObjectId): Last read message
- `lastReadTimestamp` (Date): Last read time
- `isBanned` (boolean): Ban status
- `banExpiresAt` (Date): Ban expiration
- `banReason` (string): Ban reason
- `isKicked` (boolean): Kick status
- `kickedAt` (Date): Kick time
- `status` (enum): 'pending' | 'approved' | 'denied' | 'banned' | 'kicked'

### WeeklyHackathon
**File:** `backend/src/models/weeklyHackathon.model.ts`

**Key Fields:**
- `title` (string, required): Challenge title
- `description` (string, required): Challenge description
- `problem` (string, required): Problem statement
- `constraints` (string[]): Problem constraints
- `startDate` (Date, required): Start date
- `endDate` (Date, required): End date
- `isActive` (boolean): Active status
- `createdBy` (ObjectId): Creator
- `winners` (array): Challenge winners
- `leaderboard` (array): Leaderboard entries

### HackathonSubmission
**File:** `backend/src/models/hackathonSubmission.model.ts`

**Key Fields:**
- `hackathonId` (ObjectId): Hackathon reference
- `userId` (ObjectId): Submitter
- `username` (string): Submitter username
- `solution` (string, required): Solution content
- `codeFiles` (string[]): Code file URLs
- `demoUrl` (string): Demo URL
- `explanation` (string, required): Solution explanation
- `submittedAt` (Date): Submission time
- `score` (number): Submission score (0-100)
- `feedback` (string): Feedback
- `isWinner` (boolean): Winner status
- `position` (number): Leaderboard position

### ProjectShowcase
**File:** `backend/src/models/projectShowcase.model.ts`

**Key Fields:**
- `title` (string, required): Project title
- `description` (string): Project description
- `images` (string[]): Project images (max 3)
- `gitRepositoryUrl` (string, required): Git repo URL
- `demoUrl` (string, required): Demo URL
- `userId` (ObjectId): Project owner
- `username` (string): Owner username
- `upvotes` (number): Upvote count
- `upvotedBy` (ObjectId[]): Users who upvoted
- `downvotes` (number): Downvote count
- `downvotedBy` (ObjectId[]): Users who downvoted
- `submittedAt` (Date): Submission time
- `isApproved` (boolean): Approval status
- `approvedAt` (Date): Approval time
- `approvedBy` (ObjectId): Approver

---

## Nirvana

### NirvanaHackathon
**File:** `backend/src/models/nirvanaHackathon.model.ts`

**Key Fields:**
- `title` (string, required): Hackathon title
- `content` (string, required): Content
- `description` (string, required): Description
- `prize` (string, required): Prize info
- `participants` (number): Participant count
- `category` (string, required): Category
- `tags` (string[]): Tags
- `deadline` (Date, required): Application deadline
- `status` (enum): 'active' | 'upcoming' | 'completed'
- `isPinned` (boolean): Pinned status
- `isVerified` (boolean): Verification status
- `priority` (enum): 'high' | 'medium' | 'low'
- `createdBy` (ObjectId): Creator
- `reactions` (object): likes, shares, bookmarks counts
- `userReactions` (object): User reaction arrays
- `metadata` (object): hackathonName, link, image

### NirvanaNews
**File:** `backend/src/models/nirvanaNews.model.ts`

**Key Fields:**
- `title` (string, required): News title
- `content` (string, required): News content
- `category` (string, required): News category
- `tags` (string[]): News tags
- `isPinned` (boolean): Pinned status
- `isVerified` (boolean): Verification status
- `priority` (enum): 'high' | 'medium' | 'low'
- `createdBy` (ObjectId): Creator
- `reactions` (object): likes, shares, bookmarks counts
- `userReactions` (object): User reaction arrays
- `metadata` (object): progress, link, image

### NirvanaTool
**File:** `backend/src/models/nirvanaTool.model.ts`

**Key Fields:**
- `title` (string, required): Tool title
- `content` (string, required): Tool description
- `toolName` (string, required): Tool name
- `category` (string, required): Tool category
- `tags` (string[]): Tool tags
- `rating` (number): Tool rating (0-5)
- `views` (number): View count
- `isPinned` (boolean): Pinned status
- `isVerified` (boolean): Verification status
- `priority` (enum): 'high' | 'medium' | 'low'
- `createdBy` (ObjectId): Creator
- `reactions` (object): likes, shares, bookmarks counts
- `userReactions` (object): User reaction arrays
- `metadata` (object): link, image

---

## User Management

### User
**File:** `backend/src/models/user.model.ts`

**Key Fields:**
- `fullName` (string): Full name
- `username` (string, unique): Username
- `email` (string, unique): Email
- `profilePicture` (string): Profile picture URL
- `bio` (string): User bio
- `skills` (string[]): User skills
- `location` (string): Location
- `socialLinks` (object): Social media links
- `stats` (object): User statistics
- `preferences` (object): User preferences
- `achievements` (array): Achievements
- `bookmarkedResources` (ObjectId[]): Bookmarked resources
- `completedSolutions` (ObjectId[]): Completed solutions

### UserRole
**File:** `backend/src/models/userRole.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `role` (enum): 'user' | 'moderator' | 'admin'
- `channelId` (ObjectId): Channel-specific role
- `grantedBy` (ObjectId): Role granter
- `grantedAt` (Date): Grant time

---

## Notifications

### Notification
**File:** `backend/src/models/notification.model.ts`

**Key Fields:**
- `userId` (ObjectId): Recipient
- `type` (enum): 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system'
- `title` (string, required): Notification title
- `message` (string, required): Notification message
- `data` (object): Additional data
- `priority` (enum): 'low' | 'medium' | 'high' | 'urgent'
- `isRead` (boolean): Read status
- `isArchived` (boolean): Archive status
- `readAt` (Date): Read time
- `expiresAt` (Date): Expiration time

---

## Additional Models

### ProgressTracking
**File:** `backend/src/models/progressTracking.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `entityId` (ObjectId): Entity being tracked
- `entityType` (string): Entity type
- `progress` (number): Progress percentage (0-100)
- `completedAt` (Date): Completion time
- `lastAccessed` (Date): Last access time

### ResearchItem
**File:** `backend/src/models/researchItem.model.ts`

**Key Fields:**
- `userId` (ObjectId): Owner
- `title` (string): Item title
- `url` (string): Item URL
- `notes` (string): User notes
- `tags` (string[]): Item tags
- `createdAt` (Date): Creation time

### AIChatHistory
**File:** `backend/src/models/aiChatHistory.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `problemId` (ObjectId): Related problem
- `messages` (array): Chat messages
- `createdAt` (Date): Conversation start
- `updatedAt` (Date): Last message time

### WorkspaceState
**File:** `backend/src/models/workspaceState.model.ts`

**Key Fields:**
- `userId` (ObjectId): User
- `workspaceType` (string): Workspace type
- `state` (object): Workspace state
- `preferences` (object): Workspace preferences
- `lastUpdated` (Date): Last update time

---

## Content Creation Guidelines

### Crucible Problems:
1. Clear, descriptive title
2. Detailed problem description with context
3. Appropriate difficulty level
4. Relevant category and tags
5. Clear requirements and constraints
6. Expected outcome definition
7. Helpful hints without spoilers
8. Learning objectives
9. Prerequisites and related resources

### Forge Resources:
1. Descriptive title and type
2. Clear description of content
3. Appropriate difficulty level
4. Relevant tags for discoverability
5. Quality content or external links
6. Visual representation (thumbnail)

### Arena Content:
1. Clear channel purposes
2. Community guidelines compliance
3. Structured hackathon challenges
4. Complete project documentation

### Nirvana Feed:
1. High-quality, relevant content
2. Proper verification for important posts
3. Appropriate categorization
4. Community engagement focus

---

## API Endpoints

### Crucible:
- `GET /api/crucible/problems` - Get problems
- `POST /api/crucible/problems` - Create problem
- `GET /api/crucible/problems/:id` - Get specific problem
- `POST /api/crucible/problems/:id/solutions` - Submit solution

### Forge:
- `GET /api/forge` - Get resources
- `POST /api/forge` - Create resource
- `GET /api/forge/:id` - Get specific resource
- `POST /api/forge/:id/progress` - Update progress

### Arena:
- `GET /api/arena/channels` - Get channels
- `GET /api/arena/channels/:id/messages` - Get messages
- `POST /api/arena/channels/:id/messages` - Send message
- `GET /api/arena/hackathons/current` - Get current hackathon
- `POST /api/arena/showcase` - Submit project

### Nirvana:
- `GET /api/nirvana/feed` - Get social feed
- `POST /api/nirvana/hackathons` - Create hackathon post
- `POST /api/nirvana/news` - Create news post
- `POST /api/nirvana/tools` - Create tool post

---

## Best Practices

1. **Quality Content**: Focus on valuable, well-documented content
2. **User Experience**: Consider user journey and needs
3. **Community Guidelines**: Follow established standards
4. **Regular Updates**: Keep content fresh and relevant
5. **Validation**: Implement proper input validation
6. **Security**: Ensure proper access controls
7. **Performance**: Optimize queries and use caching
8. **Feedback**: Provide constructive feedback to users
9. **Recognition**: Reward user contributions
10. **Continuous Improvement**: Iterate based on feedback

This reference provides a comprehensive overview of all dynamic content types in the Zemon application for content creation, development, and maintenance.
