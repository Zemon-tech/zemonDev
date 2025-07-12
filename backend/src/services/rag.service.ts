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
    console.log(`Retrieving relevant documents for query: "${queryText.substring(0, 50)}..."`);
    
    // Check if environment variables are set
    if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
      console.error('Missing Upstash Vector credentials in environment variables');
      throw new Error('Upstash Vector credentials not configured');
    }
    
    // Generate embedding for the query text
    const queryEmbedding = await generateQueryEmbedding(queryText);
    console.log(`Generated embedding with ${queryEmbedding.length} dimensions`);

    // Prepare request body
    const requestBody = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };
    
    console.log(`Querying Upstash Vector at ${UPSTASH_VECTOR_REST_URL}/query`);
    
    // Query the vector database using the REST API
    const response = await fetch(`${UPSTASH_VECTOR_REST_URL}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_VECTOR_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Vector DB API returned status: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to query vector database: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`Vector DB response received. Response type: ${typeof responseData}`);
    console.log(`Response keys: ${Object.keys(responseData).join(', ')}`);
    
    // Based on the logs, we know the response has a 'result' property (singular)
    let matches = [];
    
    // Handle all possible response formats from Upstash Vector
    if (responseData.result && Array.isArray(responseData.result)) {
      console.log('Found results in responseData.result');
      matches = responseData.result;
    } else if (responseData.matches && Array.isArray(responseData.matches)) {
      console.log('Found results in responseData.matches');
      matches = responseData.matches;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      console.log('Found results in responseData.results');
      matches = responseData.results;
    } else if (Array.isArray(responseData)) {
      console.log('Response is directly an array');
      matches = responseData;
    } else {
      console.error('Unexpected response format from vector database:', 
        JSON.stringify(responseData).substring(0, 200));
      return [];
    }

    console.log(`Found ${matches.length} matches from vector database`);
    
    // Extract the text content from the results
    const relevantDocuments = matches
      .map((result: VectorQueryResult) => {
        // Log each match's metadata structure to help debug
        if (result.metadata) {
          console.log(`Match metadata keys: ${Object.keys(result.metadata).join(', ')}`);
        }
        
        if (result.metadata && result.metadata.text_content) {
          return result.metadata.text_content;
        } else if (result.metadata && result.metadata.content) {
          // Some implementations might use 'content' instead of 'text_content'
          return result.metadata.content;
        }
        return '';
      })
      .filter((text: string) => text !== '');

    console.log(`Extracted ${relevantDocuments.length} text documents from matches`);
    return relevantDocuments;
  } catch (error) {
    console.error('Error retrieving relevant documents:', error);
    throw new Error('Failed to retrieve relevant documents from vector database');
  }
} 