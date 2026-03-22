# EIRA Project Summary

## Project Overview
EIRA (Evaluative Interview Response Analyzer) is a full-stack web application designed for AI-powered mock technical interviews. It uses speech recognition, machine learning-based fluency/confidence scoring, semantic similarity evaluation, and AI-driven feedback to provide users with a realistic and data-driven interview preparation experience.

## Core Functionalities

### 1. User Authentication
- Firebase-based sign-in and sign-up
- Role-based access control (user, mentor, admin)
- Protected routes using `Protected.js`, `AdminProtected.js`, `MentorProtected.js`

### 2. Interview Delivery and UX
- `SpeechRecognition.js`: core interview session component
- Text-to-speech question reading via SpeechSynthesis
- Question progress bar and countdown timer
- Conversation flow: ask question, record answer, score, then next

### 3. Speech Recognition
- Uses `webkitSpeechRecognition` (Chrome) for real-time speech capture
- Live transcription display and final text answer
- Edit/Save transcript functionality

### 4. ML Scoring and Analysis
- TensorFlow.js + `@tensorflow-models/speech-commands` model loading in frontend
- Fluency analysis via `analyzeFluency(text, duration)`
- Confidence prediction from simulated audio features via `predictConfidenceFromAudio(features)`
- Technical relevance by domain via `calculateTechnicalRelevance(text, type)`
- Semantic matching using `calculateSemanticSimilarity(userAnswer, expectedAnswer)`
- Keyword match via `calculateKeywordMatch(userAnswer, expectedAnswer, interviewType)`
- Scoring formula combines semantic score + keyword score + ML bonus (fluency/confidence/technical)
- Per-question score tracked in `questionScores` object
- Final score aggregated and normalized to 0-100

### 5. Feedback and Reporting
- `EnhancedFinish.js` displays summary and topic breakdown
- Includes detailed per-question ML metrics: fluency, text & audio confidence, technical relevance
- Feedback text generated via backend `/completions` endpoint
- AI feedback improved through question-level analysis in `getFeedback`
- Saved user interview data to DB with `userInterview` logging

### 6. Backend and API
- Express server with routes: `/interview`, `/user`, `/userInterview`, `/chat`, `/ads`, `/mentor`, `/api/contacts`
- `/completions` endpoint as AI feedback provider (with fallback scoring logic)
- `analyzeInterviewContent()` helper for structured scoring and recommendations
- MongoDB/Mongoose for data persistence: interviews, user profile, chat, mentor, contacts

### 7. Chat and Mentor System
- `ChatWindow`, `MentorChatPanel`, `UserChatPanel` for messaging
- Real-time chat data flows through backend `chat` route and `messageSchema`
- Uploads support in `/uploads/chat-files`

### 8. Admin and Management
- Admin dashboard pages for user and contact management
- Deactivation workflows documented in `DEACTIVATION_SYSTEM.md`
- Email notification support via `EMAIL_SETUP_GUIDE.md` and backend mail test scripts

### 9. UI/UX and Extras
- Components: `Navbar`, `Footer`, `LoadingComponent`, `ThemeToggle`, etc.
- Framer Motion for animation transitions
- Responsive design and modern UI components
- Theme context (light/dark switch)

## Technology Stack

### Frontend
- React 18
- Create React App + CRACO (for TF.js polyfills)
- React Router DOM
- TensorFlow.js (`@tensorflow/tfjs`, `@tensorflow-models/speech-commands`)
- Material-UI icons
- Framer Motion
- Axios
- Web Speech API + Web Audio API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Firebase Authentication (frontend)
- Google Generative AI (`@google/generative-ai`) integration placeholder
- body-parser, cors, node-fetch

### Dev Tools
- VS Code
- npm
- ESLint
- CRACO

## Research Contributions
- Hybrid scoring combining speech fluency, confidence estimation, and semantic similarity
- Interview domain adaptation (Algorithms, DBMS, OS, Networks, etc.)
- Controlled 5-point per-question scoring with psychological features (hesitation/filler detection)
- AO engagement: persistent user interview history and analytics
- AI narrative feedback plus fine-grained metrics in UX

---

## Usage Instructions
1. Start backend: `cd backend && npm install && npm start`
2. Start frontend: `cd frontend && npm install && npm start`
3. Login/signup, choose an interview, and speak into microphone
4. Finish interview; inspect `EnhancedFinish` score and AI feedback

## Notes
- Some features depend on Chrome `webkitSpeechRecognition`.
- TF.js model may require webpack polyfills (`util` in CRACO config).
- Current audio confidence is simulated when raw audio is unavailable; could be replaced with real audio extraction.
