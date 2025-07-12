**Role & Goal:** You are an expert full-stack developer specializing in the MERN stack, AI integration with Google Gemini, and RAG systems. Your goal is to implement a comprehensive, RAG-powered solution analysis feature in this project. This involves updating the backend to use a RAG pipeline and a new Gemini Pro model for analysis, and connecting this to a dynamic frontend results page.

**High-Level Context:**

  * **Trigger:** The flow starts when a user submits their solution on a Crucible problem page by clicking on the submit solution button.
  * **Core Logic:** The backend will gather the user's solution, the problem's details, relevant documents from a vector store (RAG), and a new set of "technical parameters" for that problem. This context will be sent to the `gemini-2.5-pro` model to generate a detailed analysis.
  * **Output:** The analysis will be a structured JSON object used to populate a new, dynamic results page (`ResultPage.tsx`), replacing the current dummy data.
  * **Provided Files:** You have the context for `project-context.json` (Zemon platform), `rag-system-implementation.json` (admin RAG setup), `ai.service.ts` (current AI service), `ResultPage.tsx` (target UI), and images of the target UI.

-----

### **Part 1: Backend Implementation**
#### **Step 1.1: Environment & Configuration**

1.  In the `zemon` backend's `.env` file, add a new variable: `GEMINI_PRO_API_KEY`.
2.  In the `.env` file, set this new variable to the actual API key for the Gemini 2.5 Pro model.
3.  The `rag-system-implementation.json` mentions environment variables `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`. Ensure these are also present in the `zemon` backend's environment files, as we will need them to query the vector database.

#### **Step 1.2: Database Model Updates**

1.  Locate the Mongoose schema for `CrucibleProblem` (likely in `src/models/crucibleProblem.model.ts`).
2.  Add a new field to the schema:
    ```typescript
    technicalParameters: {
      type: [String],
      required: false, // Make it optional for now to not break existing problems
      default: []
    }
    ```

#### **Step 1.3: RAG Service Implementation**

We need to create a service in the `zemon` backend to *query* the RAG system that the `zemon-admin` app manages.

1.  Create a new file: `src/services/rag.service.ts`.
2.  Inside this file, implement the logic to connect to and query the Upstash Vector database. You can reference the architecture in `rag-system-implementation.json`.
3.  **Create an Embedding Function:** Implement a function `generateQueryEmbedding(text: string)` that uses the Gemini embedding model (`text-embedding-004` as per the RAG context) to create a vector from a text query.
4.  **Create a Query Function:** Implement an async function `retrieveRelevantDocuments(queryText: string, topK: number = 5)`.
      * This function should first call `generateQueryEmbedding` on the `queryText`.
      * Then, it should use the Upstash Vector client to perform a `query` operation against your index, searching for the `topK` most similar vectors.
      * The function should extract the `text_content` from the metadata of the returned vectors and return an array of these text snippets.

#### **Step 1.4: New Solution Analysis Service**

Create a new, separate AI service for this high-stakes analysis. This keeps it isolated from the existing chat/hint service.

1.  Create a new file: `src/services/solutionAnalysis.service.ts`.
2.  **Define the Output Interface:** At the top of the file, define the exact TypeScript interface for the JSON object you expect from the AI. This is critical for type safety and prompt clarity.
    ```typescript
    export interface IAnalysisParameter {
      name: string;
      score: number; // Score out of 100
      justification: string; // AI's reasoning for this score
    }

    export interface ISolutionAnalysisResult {
      overallScore: number;
      aiConfidence: number; // A score from 0-100 on how confident the AI is
      summary: string;
      evaluatedParameters: IAnalysisParameter[];
      feedback: {
        strengths: string[];
        areasForImprovement: string[];
        suggestions: string[];
      };
    }
    ```
3.  **Initialize Gemini 2.5 Pro:**
      * Import `GoogleGenerativeAI`.
      * Initialize it with the `GEMINI_PRO_API_KEY` from the environment.
      * Configure the model to use `gemini-2.5-pro`. Set `response_mime_type` to `application/json` in the `generationConfig` to ensure JSON output.
4.  **Create the Main Analysis Function:** Create an async function `generateComprehensiveAnalysis`.
      * **Function Signature:** It should accept `problemDetails`, `userSolution`, `ragDocuments`, and `technicalParameters` as arguments.
      * **Prompt Construction:** This is the most important step. Build a detailed prompt string.
          * **Set the Persona:** "You are a world-class AI system architect and engineering hiring manager..."
          * **Provide Context:** Include sections in the prompt for `## PROBLEM DETAILS ##`, `## TECHNICAL & ARCHITECTURAL PARAMETERS TO EVALUATE ##`, `## RELEVANT KNOWLEDGE BASE DOCUMENTS (FOR CONTEXT) ##`, and `## USER'S SUBMITTED SOLUTION ##`. Populate these sections with the function arguments.
          * **Define the Task:** Clearly instruct the AI to analyze the user's solution based on *all* provided context.
          * **Specify the Output Format:** Explicitly tell the AI to return *only* a single, valid JSON object that adheres to the `ISolutionAnalysisResult` interface you defined above. Paste the TypeScript interface definition into the prompt as a schema guide.
      * **Call the AI & Parse:** Call `model.generateContent()`, get the response text, and use a safe JSON parser to convert it into an `ISolutionAnalysisResult` object.

#### **Step 1.5: New Database Model for Results**

The analysis result is too complex to store casually. It needs its own model.

1.  Create a new file: `src/models/solutionAnalysis.model.ts`.
2.  Define a Mongoose schema based on the `ISolutionAnalysisResult` interface. Add `userId` and `problemId` fields to link it back to the user and the problem.
    ```typescript
    // ... inside the schema definition
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CrucibleProblem', required: true },
    // ... fields from ISolutionAnalysisResult
    ```

#### **Step 1.6: Controller and Route**

Expose the functionality through a new API endpoint.

1.  In a `crucible.controller.ts` file, create a new async controller function `analyzeUserSolution`.
2.  **Orchestration Logic:**
      * Get `problemId` from `req.params` and `userId` from `req.user`.
      * Fetch the `CrucibleProblem` from the database.
      * Fetch the user's `SolutionDraft`.
      * Construct a query for the RAG service (e.g., combine problem title and user solution). Call `retrieveRelevantDocuments` from `rag.service.ts`.
      * Call `generateComprehensiveAnalysis` from your new `solutionAnalysis.service.ts`, passing all the context.
      * Once you receive the analysis JSON, create a new document using the `SolutionAnalysis` model and save it to the database.
      * Respond to the frontend with the `_id` of the newly created analysis document.
3.  In a `crucible.routes.ts` file, create a new `POST` route: `/:problemId/analyze`. Wire it to the new controller and protect it with auth middleware.
4.  Create another `GET` route `results/:analysisId` to fetch a specific analysis result by its ID for the results page.

-----

### **Part 2: Frontend Implementation**

Now, let's update the UI to trigger the analysis and display the results.

#### **Step 2.1: API Client**

1.  Create a new api client in your frontend API client library (e.g., `src/lib/resultApi.ts`), add two these functions:
      * `submitSolutionForAnalysis(problemId: string): Promise<{ analysisId: string }>` to call the `POST /api/crucible/:problemId/analyze` endpoint.
      * `getAnalysisResult(analysisId: string): Promise<ISolutionAnalysisResult>` to call the `GET /api/crucible/results/:analysisId` endpoint.

#### **Step 2.2: Update Submission Flow**

1.  Navigate to the component that contains the "Submit" button for a Crucible problem.
2.  Modify the `onClick` handler of this button.
      * It should now call the `submitSolutionForAnalysis` function.
      * Implement a loading state. Show a modal or a spinner to inform the user that their solution is being analyzed. This may take some time.
      * On a successful response, use `react-router-dom`'s `useNavigate` hook to redirect the user to the results page using the returned `analysisId`: `Maps(\`/crucible/results/${response.analysisId}\`);\`.

#### **Step 2.3: Refactor the Results Page**

1.  Open `src/pages/ResultPage.tsx`.
2.  **Remove Dummy Data:** Delete the entire `dummyResult` object.
3.  **Fetch Live Data:**
      * Use the `useParams` hook from `react-router-dom` to get the `analysisId` from the URL.
      * Use a state management library or a `useEffect` hook with `useState` to fetch the analysis data by calling `getAnalysisResult(analysisId)`.
      * Manage loading and error states. While loading, display a skeleton screen that mimics the final layout. If there's an error, show an error message.
4.  **Connect Data to UI:**
      * Replace all instances of `dummyResult` with your fetched data state (e.g., `analysisData`).
      * For the "Mind Characteristics" grid, you will now map over the `analysisData.evaluatedParameters` array to render the `CharacteristicBadge` components dynamically.
      * Update all other sections (summary, score, strengths, etc.) to use the properties from your fetched data object. The component structure in `ResultPage.tsx` is already well-aligned with the `ISolutionAnalysisResult` interface, so this should be a straightforward mapping.
