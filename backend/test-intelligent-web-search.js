const { shouldUseWebSearch } = require('./src/services/ai.service');

// Test cases for intelligent web search detection
const testCases = [
  // Should trigger web search
  "What is the latest version of React?",
  "Search for current AI trends",
  "Find recent developments in machine learning",
  "How to implement the latest ES2023 features?",
  "What are the current best practices for TypeScript?",
  "Latest news about WebAssembly",
  "Recent research on quantum computing",
  "Current status of WebGPU",
  "Breaking news in tech",
  "Trending programming languages 2024",
  
  // Should NOT trigger web search
  "Hello, how are you?",
  "Can you help me debug this code?",
  "What's the time complexity of quicksort?",
  "Explain how recursion works",
  "Help me understand closures in JavaScript",
  "What's the difference between let and const?",
  "How do I create a function?",
  "Explain the concept of promises",
  "What is object-oriented programming?",
  "Help me with this algorithm"
];

console.log("🧪 Testing Intelligent Web Search Detection\n");

testCases.forEach((testCase, index) => {
  const shouldSearch = shouldUseWebSearch(testCase);
  const emoji = shouldSearch ? "🔍" : "❌";
  const status = shouldSearch ? "WILL search" : "WON'T search";
  
  console.log(`${emoji} Test ${index + 1}: ${status}`);
  console.log(`   Query: "${testCase}"`);
  console.log(`   Decision: ${shouldSearch ? 'YES - Web search needed' : 'NO - Web search not needed'}\n`);
});

console.log("✅ Test completed!");
console.log("\n💡 The AI will now automatically use web search when:");
console.log("   • Users ask about current events, news, or recent developments");
console.log("   • Queries contain time-sensitive keywords (latest, current, recent)");
console.log("   • Questions start with what, how, when, where, who");
console.log("   • Users explicitly request search-related actions");
console.log("\n🚫 The AI will NOT use web search for:");
console.log("   • General programming concepts and explanations");
console.log("   • Algorithm analysis and code review");
console.log("   • Casual conversation and greetings");
console.log("   • Basic programming questions");
