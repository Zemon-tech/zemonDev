import { generateQueryEmbedding, retrieveRelevantDocuments } from '../services/rag.service';
import env from '../config/env';

async function testVectorConnection() {
  console.log('Testing Upstash Vector connection...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log(`UPSTASH_VECTOR_REST_URL: ${env.UPSTASH_VECTOR_REST_URL ? 'Set' : 'Not set'}`);
  console.log(`UPSTASH_VECTOR_REST_TOKEN: ${env.UPSTASH_VECTOR_REST_TOKEN ? 'Set' : 'Not set'}`);
  console.log(`GEMINI_API_KEY: ${env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
  
  if (!env.UPSTASH_VECTOR_REST_URL || !env.UPSTASH_VECTOR_REST_TOKEN || !env.GEMINI_API_KEY) {
    console.error('Required environment variables are missing. Please check your .env file.');
    return;
  }
  
  try {
    // Test embedding generation
    console.log('\nTesting embedding generation...');
    const testText = 'This is a test query to verify the embedding model is working correctly.';
    const embedding = await generateQueryEmbedding(testText);
    console.log(`Successfully generated embedding with ${embedding.length} dimensions`);
    
    // Test vector database query
    console.log('\nTesting vector database query...');
    const results = await retrieveRelevantDocuments(testText, 3);
    console.log(`Successfully retrieved ${results.length} documents from vector database`);
    
    if (results.length > 0) {
      console.log('\nSample document:');
      console.log(results[0].substring(0, 200) + '...');
    } else {
      console.log('No documents found in the vector database. You may need to populate it first.');
    }
    
    console.log('\nVector connection test completed successfully!');
  } catch (error) {
    console.error('Error during vector connection test:', error);
  }
}

// Run the test
testVectorConnection().catch(console.error); 