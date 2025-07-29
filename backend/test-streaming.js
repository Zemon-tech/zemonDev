const { generateStreamingChatResponse } = require('./dist/services/ai.service');

async function testStreaming() {
  console.log('Testing streaming functionality...');
  
  const messages = [
    {
      role: 'user',
      content: 'Hello, can you help me with a programming problem?',
      timestamp: new Date()
    }
  ];

  try {
    const stream = generateStreamingChatResponse(messages);
    let totalContent = '';
    
    for await (const chunk of stream) {
      if (chunk.error) {
        console.error('Error:', chunk.content);
        break;
      }
      
      if (chunk.content) {
        totalContent += chunk.content;
        process.stdout.write(chunk.content); // Print without newline
      }
      
      if (chunk.isComplete) {
        console.log('\n\nStream completed!');
        console.log('Total content length:', totalContent.length);
        break;
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStreaming(); 