// Test file to demonstrate strict validation
// This shows examples of what will be rejected and accepted

const testCases = {
    // These will be REJECTED:
    rejected: [
        "vvvvvvvvvvv",           // Repeated characters
        "dfghjjhgf",             // Random character sequence
        "aaaaaaaaaa",             // All same characters
        "qwertyuiop",            // Keyboard sequence
        "asdfghjkl",             // Random typing
        "123456789",             // Numbers only
        "a b c d",               // Single letters
        "what is",               // Too short
        "what is programming",   // No question mark
    ],
    
    // These will be ACCEPTED:
    accepted: [
        "What is object-oriented programming?",
        "How do you implement a binary search tree?",
        "Explain the difference between SQL and NoSQL databases?",
        "What are the key principles of software engineering?",
        "How would you optimize a slow database query?",
        "Describe the MVC architecture pattern?",
        "What is the difference between REST and GraphQL?",
        "How do you handle memory management in JavaScript?",
        "Explain the concept of microservices architecture?",
        "What are the benefits of using version control systems?"
    ]
};

console.log("Strict Validation Test Cases:");
console.log("REJECTED examples:", testCases.rejected);
console.log("ACCEPTED examples:", testCases.accepted);

export default testCases;

