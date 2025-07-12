import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Initialize Upstash Vector client
// We'll use the fetch API directly since we don't have the @upstash/vector package
const UPSTASH_VECTOR_REST_URL = env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_VECTOR_REST_TOKEN = env.UPSTASH_VECTOR_REST_TOKEN;

interface VectorQueryResult {
  id: string;
  score: number;
  vector: number[];
  metadata?: {
    text_content?: string;
    source_document_id?: string;
    document_title?: string;
    document_type?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * Generates an embedding vector for the given text using the text-embedding-004 model.
 * @param text - The text to generate an embedding for
 * @returns A vector (array of numbers) representing the text
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  try {
    // Get the embedding model from the initialized genAI client
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Generate the embedding
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;

    if (!embedding || !embedding.values) {
      throw new Error('Invalid embedding response from API');
    }

    return embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding for query');
  }
}

/**
 * Retrieves relevant documents from the vector database based on a query text
 * @param queryText - The text to search for
 * @param topK - Number of results to return (default: 5)
 * @returns Array of text snippets from the most relevant documents
 */
export async function retrieveRelevantDocuments(queryText: string, topK: number = 5): Promise<string[]> {
  try {
    // Generate embedding for the query text
    const queryEmbedding = await generateQueryEmbedding(queryText);

    // Query the vector database using the REST API
    const response = await fetch(`${UPSTASH_VECTOR_REST_URL}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_VECTOR_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to query vector database: ${response.statusText}`);
    }

    const results: VectorQueryResult[] = await response.json();

    // Extract the text content from the results
    const relevantDocuments = results
      .map((result: VectorQueryResult) => {
        if (result.metadata && result.metadata.text_content) {
          return result.metadata.text_content;
        }
        return '';
      })
      .filter((text: string) => text !== '');

    return relevantDocuments;
  } catch (error) {
    console.error('Error retrieving relevant documents:', error);
    throw new Error('Failed to retrieve relevant documents from vector database');
  }
} 