const express = require("express")
const fetch = require('node-fetch')
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
const interviewRoutes = require("./routes/interview.js")
const userRoutes = require("./routes/users.js")
const userInterviewRoutes = require("./routes/userInterview.js")
const contactRoutes = require("./routes/contact.js")
const mentorRoutes = require("./routes/mentor.js")
const adRoutes = require("./routes/ad.js")
const chatRoutes = require("./routes/chat.js")
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express()
const cors = require("cors")
app.use(cors())
require('dotenv/config');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Serve uploaded files
app.use('/uploads', express.static('uploads'))
app.use("/interview", interviewRoutes)
app.use("/user", userRoutes)
app.use("/userInterview", userInterviewRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/mentor", mentorRoutes)
app.use("/ads", adRoutes)
app.use("/chat", chatRoutes)

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyAtKhIeqFIWlLjPakicIRy3vpH9bbZrEu8");

// Health ping for frontend latency checks
app.get('/ping', (req, res) => {
    return res.status(204).send()
})

// Simple download test that streams N bytes
app.get('/download-test', (req, res) => {
    const sizeParam = parseInt(req.query.size, 10)
    const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : (2 * 1024 * 1024)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', size)
    // Stream chunks to avoid buffering huge memory
    const chunkSize = 64 * 1024
    let sent = 0
    const interval = setInterval(() => {
        if (sent >= size) {
            clearInterval(interval)
            return res.end()
        }
        const remaining = size - sent
        const toSend = Math.min(chunkSize, remaining)
        const buf = Buffer.allocUnsafe(toSend)
        res.write(buf)
        sent += toSend
    }, 0)
})

// Endpoint to proxy Gemini API chat completions used by the user app
app.post('/completions', async (req, res) => {
    try {
        const { message } = req.body || {}
        if (!message || typeof message !== 'string') {
            return res.status(400).send('Invalid request: missing message')
        }

        console.log('Received message for AI processing:', message);

        // For now, use a simple fallback response since AI service is not working
        // This will provide meaningful feedback and scores based on the input
        let feedback = "Thank you for completing the interview. Your responses have been recorded and will be evaluated by our team.";

        // Try to extract scores from the message if it contains score data
        const scoreMatch = message.match(/(\w+):(\d+)/g);
        if (scoreMatch && scoreMatch.length > 0) {
            const scores = {};
            scoreMatch.forEach(match => {
                const [subject, scoreValue] = match.split(':');
                // Filter out undefined or empty subjects
                if (subject && subject !== 'undefined' && subject.trim() !== '') {
                    scores[subject] = parseInt(scoreValue);
                }
            });

            // Calculate average score
            const scoreValues = Object.values(scores);
            if (scoreValues.length > 0) {
                const avgScore = Math.round(scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length);
                
                // Generate detailed feedback based on individual scores and overall performance
                const subjectFeedback = Object.entries(scores).map(([subject, subjectScore]) => {
                    if (subjectScore >= 85) return `${subject}: Excellent (${subjectScore}%)`;
                    if (subjectScore >= 70) return `${subject}: Good (${subjectScore}%)`;
                    if (subjectScore >= 60) return `${subject}: Average (${subjectScore}%)`;
                    return `${subject}: Needs Improvement (${subjectScore}%)`;
                }).join(', ');

                // Generate overall feedback based on score
                if (avgScore >= 90) {
                    feedback = `Outstanding performance! You achieved an excellent score. Your responses demonstrate exceptional technical knowledge and excellent communication skills. Subject-wise breakdown: ${subjectFeedback}. Keep up the excellent work!`;
                } else if (avgScore >= 80) {
                    feedback = `Great performance! You showed strong understanding across most topics with some areas for improvement. Subject-wise breakdown: ${subjectFeedback}. Continue building on your strengths!`;
                } else if (avgScore >= 70) {
                    feedback = `Good performance with room for growth. You demonstrated solid knowledge in some areas while others need more attention. Subject-wise breakdown: ${subjectFeedback}. Focus on the areas that need improvement.`;
                } else if (avgScore >= 60) {
                    feedback = `Satisfactory performance. There are several areas where you can enhance your technical knowledge and communication skills. Subject-wise breakdown: ${subjectFeedback}. Consider additional study and practice.`;
                } else {
                    feedback = `There's significant room for improvement across multiple areas. Subject-wise breakdown: ${subjectFeedback}. We recommend focused study and practice to strengthen your technical knowledge and communication skills.`;
                }
            }
        }

        console.log('Generated feedback:', feedback);

        return res.send(feedback)
    } catch (err) {
        console.error('Error in /completions:', err)

        // Provide a fallback response instead of just error
        const fallbackResponse = "Thank you for completing the interview. Your responses have been recorded and will be evaluated by our team.";
        return res.send(fallbackResponse)
    }
})

// Function to analyze interview content and generate accurate scores
function analyzeInterviewContent(questions, answers, interviewType) {
    if (!questions || !answers || questions.length === 0) {
        return {
            overallScore: 0,
            topicBreakdown: {},
            detailedFeedback: "No interview data provided for analysis.",
            strengths: [],
            areasForImprovement: ["Complete the interview to receive feedback"],
            recommendations: ["Please complete the interview process"]
        };
    }

    // Technical keywords for different interview types (matching the form options)
    const domainKeywords = {
        'Algorithms & Systems': ['algorithm', 'complexity', 'sorting', 'searching', 'recursion', 'dynamic programming', 'graph', 'tree', 'array', 'linked list', 'system design', 'scalability', 'performance', 'optimization'],
        'DBMS': ['sql', 'query', 'table', 'index', 'join', 'normalization', 'transaction', 'acid', 'rdbms', 'nosql', 'database', 'schema', 'relationship', 'constraint'],
        'Operating System': ['process', 'thread', 'memory', 'scheduling', 'deadlock', 'synchronization', 'kernel', 'file system', 'virtual memory', 'multiprocessing'],
        'System Software': ['compiler', 'interpreter', 'assembler', 'linker', 'loader', 'debugger', 'profiler', 'system call', 'library', 'framework'],
        'Computer Networks': ['tcp', 'udp', 'http', 'https', 'ip', 'dns', 'routing', 'protocol', 'packet', 'bandwidth', 'latency', 'network topology'],
        'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'binary', 'balanced', 'avl', 'red-black'],
        'Programming': ['function', 'class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'variable', 'loop', 'condition'],
        'Software Engineering': ['design pattern', 'mvc', 'mvp', 'mvvm', 'singleton', 'factory', 'agile', 'scrum', 'testing', 'debugging', 'version control'],
        'HR': ['experience', 'teamwork', 'leadership', 'communication', 'problem solving', 'motivation', 'career', 'goals', 'challenges', 'achievements'],
        'General': ['technical', 'implementation', 'solution', 'approach', 'method', 'process', 'framework', 'library', 'best practice', 'optimization']
    };

    let totalScore = 0;
    let validAnswers = 0;
    const topicScores = {};
    const strengths = [];
    const areasForImprovement = [];
    const recommendations = [];

    // Get the relevant keywords for this interview type
    const relevantKeywords = domainKeywords[interviewType] || domainKeywords['General'];

    // Initialize topic scores based on the interview type
    topicScores[interviewType] = 0;

    // Analyze each answer
    questions.forEach((question, index) => {
        const answer = answers[index] || '';
        if (!answer.trim()) return;

        const answerLower = answer.toLowerCase();
        const questionLower = question.toLowerCase();

        let answerScore = 0;
        let technicalMatches = 0;
        let lengthScore = 0;
        let relevanceScore = 0;

        // Length analysis (0-20 points)
        const wordCount = answer.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > 30) lengthScore = 20;
        else if (wordCount > 20) lengthScore = 15;
        else if (wordCount > 10) lengthScore = 10;
        else if (wordCount > 5) lengthScore = 5;

        // Technical content analysis (0-40 points) - use keywords specific to interview type
        relevantKeywords.forEach(keyword => {
            if (answerLower.includes(keyword.toLowerCase())) {
                technicalMatches++;
            }
        });
        const technicalScore = Math.min(40, technicalMatches * 5);

        // Relevance to question (0-20 points)
        const questionWords = questionLower.split(/\s+/).filter(word => word.length > 3);
        const relevantWords = questionWords.filter(word =>
            answerLower.includes(word) && word.length > 3
        ).length;
        relevanceScore = Math.min(20, relevantWords * 3);

        // Structure and clarity (0-20 points)
        let structureScore = 0;
        if (answer.includes('.')) structureScore += 5; // Has sentences
        if (answer.includes(',')) structureScore += 5; // Has structure
        if (wordCount > 10 && answer.length > 50) structureScore += 10; // Substantial answer

        answerScore = lengthScore + technicalScore + relevanceScore + structureScore;
        answerScore = Math.min(100, answerScore);

        totalScore += answerScore;
        validAnswers++;

        // Update topic scores based on question content and interview type
        const topicMatches = relevantKeywords.filter(keyword =>
            questionLower.includes(keyword.toLowerCase()) || answerLower.includes(keyword.toLowerCase())
        ).length;

        if (topicMatches > 0) {
            topicScores[interviewType] = Math.max(topicScores[interviewType], answerScore);
        }
    });

    const overallScore = validAnswers > 0 ? Math.round(totalScore / validAnswers) : 0;

    // Generate strengths based on performance
    if (overallScore >= 80) {
        strengths.push("Strong technical knowledge", "Clear communication", "Comprehensive understanding");
    } else if (overallScore >= 60) {
        strengths.push("Good technical foundation", "Adequate communication", "Basic understanding");
    } else {
        strengths.push("Willingness to participate", "Attempted to answer questions");
    }

    // Generate areas for improvement
    if (overallScore < 70) {
        areasForImprovement.push("Improve technical depth", "Enhance communication skills", "Study core concepts");
    }
    if (overallScore < 50) {
        areasForImprovement.push("Focus on fundamental knowledge", "Practice problem-solving", "Improve answer structure");
    }

    // Generate recommendations
    if (overallScore >= 80) {
        recommendations.push("Continue building on your strengths", "Explore advanced topics", "Mentor others");
    } else if (overallScore >= 60) {
        recommendations.push("Practice more coding problems", "Study system design", "Improve communication");
    } else {
        recommendations.push("Focus on fundamentals", "Practice regularly", "Seek mentorship");
    }

    return {
        overallScore,
        topicBreakdown: topicScores,
        detailedFeedback: `Your overall performance scored ${overallScore} out of 100. ${overallScore >= 80 ? 'Excellent work!' : overallScore >= 60 ? 'Good performance with room for improvement.' : 'Keep practicing to improve your skills.'} Focus on the areas that need attention and continue building your technical knowledge.`,
        strengths,
        areasForImprovement,
        recommendations
    };
}

// Endpoint to generate interview feedback with structured evaluation
app.post('/interview-feedback', async (req, res) => {
    try {
        const {
            interviewData,
            questions,
            answers,
            company = "Google",
            position = "Software Engineer",
            topics = ["Algorithms", "Data Structures"]
        } = req.body || {}

        if (!interviewData || !questions || !answers) {
            return res.status(400).send('Invalid request: missing interview data, questions, or answers')
        }

        // Get the Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        // Create comprehensive prompt for interview evaluation
        const evaluationPrompt = `
You are an expert technical interviewer evaluating a ${position} interview at ${company}. 

Interview Details:
- Company: ${company}
- Position: ${position}
- Topics Covered: ${topics.join(', ')}

Questions and Answers:
${questions.map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || 'No answer provided'}`).join('\n\n')}

Please provide a comprehensive evaluation in the following JSON format:
{
  "overallScore": <number between 0-100>,
  "topicBreakdown": {
    "<topic_name>": <score between 0-100>
  },
  "detailedFeedback": "<comprehensive feedback paragraph>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "areasForImprovement": ["<area1>", "<area2>", "<area3>"],
  "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"]
}

Be specific about technical knowledge, problem-solving approach, communication skills, and provide actionable feedback.
`;

        // Generate evaluation
        const result = await model.generateContent(evaluationPrompt);
        const response = await result.response;
        const content = response.text();

        // Try to parse JSON response, fallback to text if parsing fails
        let evaluation;
        try {
            evaluation = JSON.parse(content);
        } catch (parseError) {
            // If JSON parsing fails, create a structured response based on actual content analysis
            console.log('JSON parsing failed, creating structured response from text');

            // Analyze the content to generate better scores
            const contentAnalysis = analyzeInterviewContent(questions, answers, interviewData.type || 'General');

            evaluation = {
                overallScore: contentAnalysis.overallScore,
                topicBreakdown: contentAnalysis.topicBreakdown,
                detailedFeedback: content || contentAnalysis.detailedFeedback,
                strengths: contentAnalysis.strengths,
                areasForImprovement: contentAnalysis.areasForImprovement,
                recommendations: contentAnalysis.recommendations
            };
        }

        return res.json(evaluation)
    } catch (err) {
        console.error('Error in /interview-feedback:', err)
        return res.status(500).send('Internal Server Error')
    }
})

app.get("/", (req, res) => {
    res.send("Hello World")
})






var port = parseInt(process.env.PORT, 10) || 5000
let io = null

function startExpress(desiredPort, attempt = 0) {
    const server = app.listen(desiredPort, () => {
        console.log('Server listening on port', desiredPort)
    })

    // Initialize Socket.IO on the same HTTP server
    const { Server } = require('socket.io')
    io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    })
    app.set('io', io)

    const Message = require('./models/messageSchema')
    io.on('connection', (socket) => {
        socket.on('join', ({ roomId, userEmail }) => {
            if (!roomId) return
            socket.join(roomId)
            socket.data = { roomId, userEmail }
            socket.emit('joined', { roomId })
        })

        socket.on('message', async (payload) => {
            try {
                const { roomId, content, senderEmail, recipientEmail } = payload || {}
                if (!roomId || !content || !senderEmail || !recipientEmail) return
                const doc = await Message.create({ roomId, content, senderEmail, recipientEmail, readByMentor: false })
                io.to(roomId).emit('message', doc)
                // Notify mentor channel if recipient is mentor
                if (recipientEmail) {
                    const email = String(recipientEmail).toLowerCase()
                    io.to(`mentor:${email}`).emit('notify', { roomId, lastContent: content, createdAt: doc.createdAt, from: senderEmail })
                }
            } catch (e) {
                console.error('Socket message error', e)
            }
        })

        socket.on('typing', ({ roomId, userEmail, typing }) => {
            if (!roomId) return
            socket.to(roomId).emit('typing', { userEmail, typing: !!typing })
        })
    })
    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attempt < 5) {
            const nextPort = desiredPort + 1
            console.warn(`Port ${desiredPort} in use. Trying ${nextPort}...`)
            startExpress(nextPort, attempt + 1)
        } else {
            throw err
        }
    })
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MongoDB connection error: MONGO_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("✅ Connected to MongoDB");
        startExpress(port);
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("Please check your MONGO_URI in .env file");
        // Don't exit process in dev mode so we can see the error, but normally this might be fatal
    });

