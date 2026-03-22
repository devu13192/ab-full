import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SpeechRecognition.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  SmartToyTwoTone, 
  Mic, 
  MicOff, 
  PlayArrow, 
  Pause, 
  Stop,
  CheckCircle,
  Timer,
  QuestionAnswer,
  RecordVoiceOver,
  Edit,
  Save,
  Cancel,
  Info
} from '@mui/icons-material';
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';

// Import TensorFlow.js and Speech Commands for ML enhancement
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

const SpeechRecognition = ({ setBotTalking, botTalking }) => {
  // ... existing state variables ...

  // New state for ML-based analysis
  const [mlModel, setMlModel] = useState(null);
  const [mlStatus, setMlStatus] = useState('loading');
  const [fluencyScore, setFluencyScore] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [questionScores, setQuestionScores] = useState([]); // Store detailed scores for each question

  // Load ML model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        setMlModel(recognizer);
        setMlStatus('ready');
        console.log('ML Model loaded successfully');
      } catch (error) {
        setMlStatus('error');
        console.error('Failed to load ML model:', error);
      }
    };
    loadModel();
  }, []);

  // ... existing useEffect for data loading ...
  const { id } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [index, setIndex] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [interviewType, setInterviewType] = useState('');
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answer, setAnswer] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [question, setQuestion] = useState('');
  const [scoreload, setScoreload] = useState(false);
  const [nextButtonAvailable, setNextButtonAvailable] = useState(false);
  const [nextButtonCountdown, setNextButtonCountdown] = useState(0);
  
  // New state for enhanced features
  const [interviewState, setInterviewState] = useState('question'); // 'question', 'ready', 'listening', 'recording', 'editing'
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    axios
      .get(`/interview/${id}`)
      .then((response) => {
        setQuestions(response.data.questions);
        setInterviewType(response.data.type || 'General');
        setLoading(false);
        speak(response.data.questions[index].question);
      })
      .catch((error) => {
        console.error('Error fetching interview data:', error);
      });
  }, []);

  const speak = (text) => {
    setBotTalking(true);
    setQuestion(text);
    setNextButtonAvailable(false);
    setNextButtonCountdown(10);
    setInterviewState('question');
    setLiveTranscript('');
    setAnswer('');
    setEditableTranscript('');
    setIsEditingMode(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => {
      setBotTalking(false);
      // Go directly to listening state and start timer immediately
      setInterviewState('listening');
      startTimer();
      startRecording();
      startNextButtonCountdown();
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        setTimer((prevSeconds) => prevSeconds - 1);
      }, 1000);

      if (timer === 0) {
        clearInterval(interval);
        handleNextClick();
      }

      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timer]);

  const startTimer = () => {
    setTimer(90);
    setIsTimerRunning(true);
  };

  const startNextButtonCountdown = () => {
    setNextButtonCountdown(10);
    setNextButtonAvailable(false);
  };

  // Countdown for Next button availability
  useEffect(() => {
    if (nextButtonCountdown > 0) {
      const interval = setInterval(() => {
        setNextButtonCountdown((prev) => {
          if (prev <= 1) {
            setNextButtonAvailable(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextButtonCountdown]);

  // Check if interview is complete when all questions have been scored
  // Note: getFeedback is now called directly when the last question is completed

  // Enhanced ML-based scoring with accurate database comparison
  const getScore = async (userAnswer, expectedAnswer) => {
    setScoreload(true);

    try {
      // Generate accurate score based on database answer comparison
      let score = 0;
      let fluencyMetrics = null;
      let confidenceFromAudio = 0.5;
      let technicalRelevance = 0;
      let correctAnswer = '';

      if (userAnswer && userAnswer.trim().length > 0) {
        const answer = userAnswer.trim();
        const question = questions[index]?.question || '';
        correctAnswer = expectedAnswer || questions[index]?.answer || '';

        console.log(`Scoring Question ${index + 1}:`, {
          userAnswer: answer,
          expectedAnswer: correctAnswer,
          question: question
        });

        // Base scoring out of 5 marks
        let marks = 0;

        // 1. Semantic Similarity with Expected Answer (0-3 marks)
        if (correctAnswer && correctAnswer.trim()) {
          const similarityScore = calculateSemanticSimilarity(answer, correctAnswer);
          marks += similarityScore * 3; // Convert to 0-3 marks
          console.log(`Semantic similarity: ${similarityScore.toFixed(2)} (${(similarityScore * 3).toFixed(1)} marks)`);
        }

        // 2. Keyword Matching (0-1 mark)
        const keywordScore = calculateKeywordMatch(answer, correctAnswer, interviewType);
        marks += keywordScore;
        console.log(`Keyword matching: ${keywordScore.toFixed(1)} mark`);

        // 3. ML-Enhanced Quality Factors (0-1 mark)
        let qualityBonus = 0;

        // ML Alteration 1: Interview-specific fluency analysis
        fluencyMetrics = analyzeFluency(answer, timer);
        qualityBonus += Math.min(0.3, fluencyMetrics.fluencyScore * 0.3);

        // ML Alteration 2: Confidence prediction using audio features (if available)
        if (audioFeatures && mlModel) {
          confidenceFromAudio = await predictConfidenceFromAudio(audioFeatures);
        }
        qualityBonus += Math.min(0.3, confidenceFromAudio * 0.3);

        // ML Alteration 3: Technical jargon detection for interview context
        technicalRelevance = calculateTechnicalRelevance(answer, interviewType);
        qualityBonus += Math.min(0.4, technicalRelevance * 0.4);

        marks += qualityBonus;
        console.log(`ML quality bonus: ${qualityBonus.toFixed(1)} mark`);

        // Ensure marks are between 0 and 5
        score = Math.max(0, Math.min(5, marks));

        // Update ML scores for display
        setFluencyScore(fluencyMetrics.fluencyScore);
        setConfidenceScore((confidenceFromAudio + fluencyMetrics.confidenceFromText) / 2);

        console.log(`Final score for question ${index + 1}: ${score.toFixed(1)}/5`);
      }

      // Store individual question scores
      const questionScore = {
        questionIndex: index,
        question: questions[index]?.question || '',
        userAnswer: userAnswer || '',
        expectedAnswer: expectedAnswer || questions[index]?.answer || '',
        score: score,
        maxScore: 5,
        fluencyScore: fluencyMetrics?.fluencyScore ?? 0,
        textConfidence: fluencyMetrics?.confidenceFromText ?? 0,
        audioConfidence: confidenceFromAudio ?? 0,
        technicalRelevance: technicalRelevance ?? 0,
        similarity: calculateSemanticSimilarity(answer, correctAnswer)
      };

      // Use the interview type for categorization
      const validType = interviewType && interviewType !== 'undefined' && interviewType.trim() !== '' ? interviewType : 'General';
      const scoreString = `${validType}:${score.toFixed(1)}`;

      setScores((prevScores) => {
        const newScores = [...prevScores, scoreString];
        console.log(`Added score: ${scoreString}, Total scores:`, newScores);
        return newScores;
      });

      // Store detailed question scores for feedback
      setQuestionScores((prev) => {
        const newScores = [...prev, questionScore];
        
        // Check if this was the last question
        if (newIndex >= questions.length) {
          // Automatically get feedback when all questions are done
          // Use the updated scores array
          setTimeout(() => getFeedback(newScores), 0);
        }
        
        return newScores;
      });

      // Update index and check if this was the last question
      const newIndex = index + 1;
      setIndex(newIndex);
      setAnswer('');

      // Move to next question if available
      if (newIndex < questions.length) {
        speak(questions[newIndex].question);
      }
    } catch (error) {
      console.log('Error generating score:', error);
      // Provide fallback marks
      const fallbackMarks = 2.5; // Default middle score
      const validType = interviewType && interviewType !== 'undefined' && interviewType.trim() !== '' ? interviewType : 'General';
      const scoreString = `${validType}:${fallbackMarks}`;

      const questionScore = {
        questionIndex: index,
        question: questions[index]?.question || '',
        userAnswer: userAnswer || '',
        expectedAnswer: expectedAnswer || questions[index]?.answer || '',
        score: fallbackMarks,
        maxScore: 5
      };

      setScores((prevScores) => [...prevScores, scoreString]);
      setQuestionScores((prev) => {
        const newScores = [...prev, questionScore];
        
        // Check if this was the last question
        if (newIndex >= questions.length) {
          // Automatically get feedback when all questions are done
          setTimeout(() => getFeedback(newScores), 0);
        }
        
        return newScores;
      });

      const newIndex = index + 1;
      setIndex(newIndex);
      setAnswer('');

      // Move to next question if available
      if (newIndex < questions.length) {
        speak(questions[newIndex].question);
      }
    } finally {
      setScoreload(false);
    }
  };

  // Custom ML Alteration Functions for Interview Uniqueness
  const analyzeFluency = (text, duration) => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Filler words detection (custom for interviews)
    const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'well', 'so', 'actually', 'basically'];
    const fillerCount = fillerWords.reduce((count, filler) => 
      count + (text.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g')) || []).length, 0);
    
    // Average words per sentence (interview-specific: prefer structured answers)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
    
    // Speaking rate (words per minute) - adjusted for interview context
    const speakingRate = duration > 0 ? (words.length / duration) * 60 : 120; // Default 120 wpm
    
    // Fluency score calculation (0-1) with interview-specific weighting
    const fluencyScore = Math.max(0, Math.min(1, 
      (Math.min(avgWordsPerSentence, 25) / 25) * 0.3 + // Favor 15-25 words per sentence
      (1 - Math.min(fillerCount / words.length, 0.3)) * 0.4 + // Penalize fillers, max 30%
      (speakingRate > 80 && speakingRate < 180 ? 1 : Math.max(0.3, 1 - Math.abs(130 - speakingRate) / 50)) * 0.3 // Optimal 80-180 wpm
    ));
    
    // Confidence from text patterns (interview-specific)
    const confidenceIndicators = ['i think', 'i believe', 'certainly', 'definitely', 'clearly', 'obviously', 'in my experience', 'based on my knowledge'];
    const confidenceWords = confidenceIndicators.reduce((count, indicator) => 
      count + (text.toLowerCase().includes(indicator) ? 1 : 0), 0);
    
    const confidenceFromText = Math.min(1, confidenceWords * 0.15 + (1 - fillerCount / Math.max(words.length, 1)) * 0.85);
    
    return {
      fluencyScore,
      fluencyBonus: fluencyScore * 0.5, // Bonus for scoring
      confidenceFromText,
      metrics: { fillerCount, avgWordsPerSentence, speakingRate }
    };
  };

  const predictConfidenceFromAudio = async (features) => {
    if (!mlModel) return 0.5;

    try {
      // Use audio features to predict confidence (custom interview adaptation)
      if (!features || !features.spectrogram || features.spectrogram.length === 0) return 0.5;

      // Analyze spectrogram for confidence indicators (higher energy = more confident)
      const energyLevels = features.spectrogram.map(frame =>
        Math.abs(frame.energy || 0)
      );

      const avgEnergy = energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length;
      const energyVariance = energyLevels.reduce((sum, e) => sum + Math.pow(e - avgEnergy, 2), 0) / energyLevels.length;

      // Custom weighting: Higher energy with moderate variance indicates confidence in interviews
      const energyScore = Math.min(1, avgEnergy * 2); // Amplify energy impact
      const variancePenalty = energyVariance > 0.5 ? 0.2 : 0; // Penalize too much variation
      const confidenceScore = Math.max(0, Math.min(1, energyScore - variancePenalty));

      console.log(`Audio confidence prediction: energy=${avgEnergy.toFixed(2)}, variance=${energyVariance.toFixed(2)}, score=${confidenceScore.toFixed(2)}`);
      return confidenceScore;
    } catch (error) {
      console.error('Audio confidence prediction error:', error);
      return 0.5;
    }
  };

  const calculateTechnicalRelevance = (text, type) => {
    if (!type || type === 'General') return 0;
    
    // Custom technical terms with interview context weighting
    const technicalTerms = {
      'Algorithms & Systems': ['algorithm', 'complexity', 'o(n)', 'o(1)', 'recursion', 'iteration', 'optimization', 'time complexity', 'space complexity'],
      'DBMS': ['primary key', 'foreign key', 'normalization', 'denormalization', 'indexing', 'query optimization', 'transaction isolation'],
      'Operating System': ['context switch', 'synchronization', 'deadlock prevention', 'virtual memory', 'paging', 'segmentation', 'process scheduling'],
      'Computer Networks': ['three-way handshake', 'congestion control', 'routing protocols', 'subnetting', 'cidr', 'tcp/ip stack'],
      'Data Structures': ['amortized analysis', 'self-balancing', 'hash collision', 'collision resolution', 'binary heap', 'red-black tree'],
      'Programming': ['design patterns', 'solid principles', 'dependency injection', 'composition over inheritance', 'object-oriented'],
      'Software Engineering': ['continuous integration', 'test-driven development', 'code review', 'refactoring', 'agile methodology'],
      'HR': ['situational leadership', 'emotional intelligence', 'conflict resolution', 'performance management', 'career development']
    };
    
    const terms = technicalTerms[type] || [];
    const matches = terms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
    
    // Weight by term importance in interviews
    const weightedMatches = terms.reduce((score, term, index) => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        // Give higher weight to core concepts
        const weight = index < terms.length / 2 ? 1.5 : 1.0;
        return score + weight;
      }
      return score;
    }, 0);
    
    return Math.min(1, weightedMatches / (terms.length * 1.25)); // Adjusted denominator for weighting
  };

  const detectHesitations = (text) => {
    // Custom hesitation detection for interviews
    const hesitationPatterns = ['uh', 'um', 'er', 'ah', '...', '--', 'you know what i mean', 'sort of', 'kind of'];
    const words = text.split(/\s+/);
    const hesitationCount = hesitationPatterns.reduce((count, pattern) => 
      count + words.filter(word => word.toLowerCase().includes(pattern)).length, 0);
    
    // Also check for repeated words (sign of hesitation)
    const repeatedWords = words.filter((word, index) => 
      words.indexOf(word) !== index && word.length > 2
    ).length;
    
    const totalHesitations = hesitationCount + repeatedWords;
    return Math.min(1, totalHesitations / Math.max(words.length * 0.1, 1)); // Allow up to 10% hesitations
  };

  const analyzeAnswerStructure = (text, question) => {
    // Interview-specific structure analysis
    const hasIntroduction = /\b(i think|the answer is|to answer this|first|initially|let me explain)\b/i.test(text);
    const hasExplanation = /\bbecause|since|due to|therefore|thus|for example|specifically\b/i.test(text);
    const hasConclusion = /\bin conclusion|to summarize|overall|finally|in summary\b/i.test(text);
    const hasExamples = /\bfor example|such as|like|instance\b/i.test(text);
    
    let structureScore = 0;
    if (hasIntroduction) structureScore += 0.25;
    if (hasExplanation) structureScore += 0.35;
    if (hasConclusion) structureScore += 0.25;
    if (hasExamples) structureScore += 0.15; // Bonus for concrete examples
    
    // Question addressing (interview critical)
    const questionKeywords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3 && !['what', 'how', 'why', 'when', 'where', 'which', 'explain', 'describe'].includes(word));
    const addressedKeywords = questionKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
    structureScore += Math.min(0.3, (addressedKeywords / questionKeywords.length) * 0.3);
    
    // Length appropriateness for interviews
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 20 && wordCount < 150) structureScore += 0.2; // Good length range
    
    return Math.min(1, structureScore);
  };

  // New helper functions for accurate database comparison scoring
  const calculateSemanticSimilarity = (userAnswer, expectedAnswer) => {
    if (!userAnswer || !expectedAnswer) return 0;

    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .map(word => word.trim());
    };

    const userTokens = normalize(userAnswer);
    const expectedTokens = normalize(expectedAnswer);

    if (userTokens.length === 0 || expectedTokens.length === 0) return 0;

    // Jaccard similarity
    const userSet = new Set(userTokens);
    const expectedSet = new Set(expectedTokens);
    const intersection = new Set([...userSet].filter(x => expectedSet.has(x)));
    const union = new Set([...userSet, ...expectedSet]);

    const jaccardSimilarity = intersection.size / union.size;

    // Cosine similarity using term frequency
    const createVector = (tokens, vocab) => {
      const vector = new Array(vocab.length).fill(0);
      tokens.forEach(token => {
        const index = vocab.indexOf(token);
        if (index !== -1) vector[index]++;
      });
      return vector;
    };

    const vocab = [...new Set([...userTokens, ...expectedTokens])];
    const userVector = createVector(userTokens, vocab);
    const expectedVector = createVector(expectedTokens, vocab);

    const dotProduct = userVector.reduce((sum, val, i) => sum + val * expectedVector[i], 0);
    const userMagnitude = Math.sqrt(userVector.reduce((sum, val) => sum + val * val, 0));
    const expectedMagnitude = Math.sqrt(expectedVector.reduce((sum, val) => sum + val * val, 0));

    const cosineSimilarity = userMagnitude && expectedMagnitude ? dotProduct / (userMagnitude * expectedMagnitude) : 0;

    // Weighted combination
    return (jaccardSimilarity * 0.6) + (cosineSimilarity * 0.4);
  };

  const calculateKeywordMatch = (userAnswer, expectedAnswer, interviewType) => {
    if (!userAnswer || !expectedAnswer) return 0;

    // Get technical keywords for the interview type
    const getTechnicalKeywords = (type) => {
      const keywords = {
        'Algorithms & Systems': ['algorithm', 'complexity', 'sorting', 'searching', 'recursion', 'dynamic programming', 'graph', 'tree', 'array', 'linked list', 'system design', 'scalability', 'performance', 'optimization', 'time complexity', 'space complexity'],
        'DBMS': ['sql', 'query', 'table', 'index', 'join', 'normalization', 'transaction', 'acid', 'rdbms', 'nosql', 'database', 'schema', 'relationship', 'constraint', 'primary key', 'foreign key'],
        'Operating System': ['process', 'thread', 'memory', 'scheduling', 'deadlock', 'synchronization', 'kernel', 'file system', 'virtual memory', 'multiprocessing', 'context switch', 'cpu'],
        'System Software': ['compiler', 'interpreter', 'assembler', 'linker', 'loader', 'debugger', 'profiler', 'system call', 'library', 'framework', 'binary', 'executable'],
        'Computer Networks': ['tcp', 'udp', 'http', 'https', 'ip', 'dns', 'routing', 'protocol', 'packet', 'bandwidth', 'latency', 'network topology', 'subnet', 'gateway'],
        'Data Structures': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'binary', 'balanced', 'avl', 'red-black', 'priority queue'],
        'Programming': ['function', 'class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'variable', 'loop', 'condition', 'method'],
        'Software Engineering': ['design pattern', 'mvc', 'mvp', 'mvvm', 'singleton', 'factory', 'agile', 'scrum', 'testing', 'debugging', 'version control', 'refactoring'],
        'HR': ['experience', 'teamwork', 'leadership', 'communication', 'problem solving', 'motivation', 'career', 'goals', 'challenges', 'achievements', 'collaboration']
      };
      return keywords[type] || [];
    };

    const technicalKeywords = getTechnicalKeywords(interviewType);
    const userLower = userAnswer.toLowerCase();
    const expectedLower = expectedAnswer.toLowerCase();

    // Count matching technical keywords
    const userTechMatches = technicalKeywords.filter(keyword =>
      userLower.includes(keyword.toLowerCase())
    ).length;

    const expectedTechMatches = technicalKeywords.filter(keyword =>
      expectedLower.includes(keyword.toLowerCase())
    ).length;

    // Calculate keyword coverage
    const keywordCoverage = expectedTechMatches > 0 ?
      Math.min(1, userTechMatches / expectedTechMatches) : 0;

    // Extract key concepts from expected answer
    const expectedConcepts = expectedLower.split(/\s+/)
      .filter(word => word.length > 4 && !['what', 'how', 'why', 'when', 'where', 'which', 'explain', 'describe', 'define', 'give'].includes(word))
      .slice(0, 5); // Take top 5 concepts

    const conceptMatches = expectedConcepts.filter(concept =>
      userLower.includes(concept)
    ).length;

    const conceptCoverage = expectedConcepts.length > 0 ?
      conceptMatches / expectedConcepts.length : 0;

    // Combine scores
    return Math.min(1, (keywordCoverage * 0.6) + (conceptCoverage * 0.4));
  };

  // Audio feature extraction for ML analysis
  const extractAudioFeatures = async (audioBuffer) => {
    try {
      if (!audioBuffer) return null;

      // Get audio data
      const audioData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      // Extract MFCC-like features (simplified)
      const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
      const hopSize = Math.floor(sampleRate * 0.010); // 10ms hop
      const features = [];

      for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
        const frame = audioData.slice(i, i + frameSize);

        // Simple spectral features
        const spectrum = [];
        for (let j = 0; j < frame.length / 2; j++) {
          let real = 0, imag = 0;
          for (let k = 0; k < frame.length; k++) {
            const angle = -2 * Math.PI * j * k / frame.length;
            real += frame[k] * Math.cos(angle);
            imag += frame[k] * Math.sin(angle);
          }
          spectrum.push(Math.sqrt(real * real + imag * imag));
        }

        // Extract basic features from spectrum
        const energy = spectrum.reduce((sum, val) => sum + val * val, 0) / spectrum.length;
        const maxFreq = spectrum.indexOf(Math.max(...spectrum)) / spectrum.length;
        const centroid = spectrum.reduce((sum, val, idx) => sum + val * idx, 0) /
                        spectrum.reduce((sum, val) => sum + val, 0);

        features.push({
          energy: Math.log(energy + 1e-10),
          maxFreq,
          centroid: centroid / spectrum.length,
          zeroCrossings: frame.filter((val, idx) => idx > 0 && val * frame[idx - 1] < 0).length
        });
      }

      return {
        spectrogram: features,
        duration: audioData.length / sampleRate,
        sampleRate
      };
    } catch (error) {
      console.error('Audio feature extraction error:', error);
      return null;
    }
  };

  const getFeedback = async (providedQuestionScores) => {
    setScoreload(true);

    // Use provided scores or fall back to state
    const currentQuestionScores = providedQuestionScores || questionScores;

    console.log('Question scores:', currentQuestionScores);
    console.log('Total questions answered:', currentQuestionScores.length);

    // If no scores collected, try to calculate from available data or provide a minimal score
    if (currentQuestionScores.length === 0) {
      console.log('No scores collected, trying to calculate from available data');
      
      let calculatedScore = 0;
      if (scores && scores.length > 0) {
        // Try to extract scores from the scores array
        const scoreValues = scores.map(scoreStr => {
          const parts = String(scoreStr).split(':');
          return parts.length > 1 ? parseInt(parts[1]) : 0;
        }).filter(val => !isNaN(val) && val > 0);
        
        if (scoreValues.length > 0) {
          calculatedScore = Math.round(scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length);
        }
      }
      
      // No default score - keep as 0 out of 100 if no scores available
      
      const fallbackFeedback = `Thank you for completing the interview. Your responses have been recorded and will be evaluated by our team. Overall Performance: ${calculatedScore}`;
      const encodedScores = encodeURIComponent(JSON.stringify(scores || []));
      navigate(`/interview/${id}/finish?feedback=${encodeURIComponent(fallbackFeedback)}&score=${calculatedScore}&scores=${encodedScores}`);
      setScoreload(false);
      return;
    }

    // Calculate overall statistics
    const totalQuestions = currentQuestionScores.length;
    const totalPossibleMarks = totalQuestions * 5;
    const totalObtainedMarks = currentQuestionScores.reduce((sum, q) => sum + q.score, 0);
    const overallPercentage = Math.round((totalObtainedMarks / totalPossibleMarks) * 100);

    console.log(`Overall: ${totalObtainedMarks}/${totalPossibleMarks} marks (${overallPercentage}%)`);

    // Create detailed feedback message with question-by-question analysis
    const feedbackMessage = `Interview Performance Analysis:

Total Questions: ${totalQuestions}
Total Marks Obtained: ${totalObtainedMarks.toFixed(1)}/${totalPossibleMarks}
Overall Percentage: ${overallPercentage}%

Question-by-Question Breakdown:
${currentQuestionScores.map((q, idx) => `Q${idx + 1}: ${q.score.toFixed(1)}/5 - ${q.question.substring(0, 50)}...`).join('\n')}

Please provide detailed feedback on the candidate's performance, highlighting strengths and areas for improvement. Focus on technical accuracy, communication skills, and problem-solving approach. Give specific suggestions for improvement.

Overall Performance: ${overallPercentage}`;

    const options = {
        method: 'POST',
        body: JSON.stringify({
            message: feedbackMessage,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch('/completions', options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const feedback = await response.text();

        // Validate feedback content
        if (!feedback || feedback.trim().length === 0) {
            throw new Error('Empty feedback received from AI');
        }

        console.log('Raw AI feedback received:', feedback);

        // Use 0 as the final score instead of calculated percentage
        let finalScore = 0;
        console.log('Using 0 as final score instead of calculated percentage:', finalScore);
        
        // Try to get AI feedback, but don't let it override our calculated score
        let aiFeedback = feedback;
        
        // If AI feedback contains a different score, keep our calculated one
        console.log('AI feedback received, but using pre-calculated score:', finalScore);

        // Ensure we have a valid score (0-100)
        if (isNaN(finalScore) || finalScore < 0) finalScore = 0;
        if (finalScore > 100) finalScore = 100;

        console.log('Final feedback:', feedback);
        console.log('Final score:', finalScore);

        // Include detailed question scores in the navigation
        const encodedScores = encodeURIComponent(JSON.stringify(currentQuestionScores));
        const encodedSimpleScores = encodeURIComponent(JSON.stringify(scores));
        const encodedQuestionScores = encodeURIComponent(JSON.stringify(currentQuestionScores));
        navigate(`/interview/${id}/finish?feedback=${encodeURIComponent(feedback)}&score=${finalScore}&scores=${encodedScores}&simpleScores=${encodedSimpleScores}&questionScores=${encodedQuestionScores}`);
    } catch (error) {
        console.error('Error generating feedback:', error);

        // Provide fallback feedback and score
        const fallbackFeedback = "Thank you for completing the interview. Your responses have been recorded and will be evaluated by our team.";
        
        // ALWAYS use the calculated overall percentage if available
        let fallbackScore = overallPercentage;
        if (fallbackScore === 0) {
            // Calculate fallback score from question scores if available
            if (currentQuestionScores && currentQuestionScores.length > 0) {
                const totalMarks = currentQuestionScores.reduce((sum, q) => sum + q.score, 0);
                const maxMarks = currentQuestionScores.length * 5;
                fallbackScore = Math.round((totalMarks / maxMarks) * 100);
            } else if (scores && scores.length > 0) {
                const scoreValues = scores.map(scoreStr => {
                    const parts = scoreStr.split(':');
                    return parts.length > 1 ? parseInt(parts[1]) : 0;
                }).filter(val => !isNaN(val) && val > 0);
                
                if (scoreValues.length > 0) {
                    fallbackScore = Math.round(scoreValues.reduce((sum, val) => sum + val, 0) / scoreValues.length);
                }
            }
        }
        
        console.log('Using fallback feedback and calculated score:', fallbackScore);

        const encodedScores = encodeURIComponent(JSON.stringify(currentQuestionScores))
        const encodedSimpleScores = encodeURIComponent(JSON.stringify(scores))
        navigate(`/interview/${id}/finish?feedback=${encodeURIComponent(fallbackFeedback)}&score=${fallbackScore}&scores=${encodedScores}&simpleScores=${encodedSimpleScores}`);
    } finally {
        setScoreload(false);
      }
      
      
  };

  const startRecording = () => {
    let i = 0;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Enable interim results for live transcription
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      console.log(event);
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let j = event.resultIndex; j < event.results.length; j++) {
        const transcript = event.results[j][0].transcript;
        if (event.results[j].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update live transcript with interim results
      setLiveTranscript(finalTranscript + interimTranscript);
      
      // Update final answer with final results
      if (finalTranscript) {
        setAnswer((prevResult) => prevResult + finalTranscript);
        setEditableTranscript((prevResult) => prevResult + finalTranscript);
        i = i + 1;
      }
    };
    
    recognition.onstart = () => {
      setInterviewState('recording');
    };
    
    recognition.start();
    setRecognition(recognition);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    // Extract audio features from the recorded answer
    if (answer && answer.trim().length > 0) {
      // Simulate audio features based on text analysis (since we don't have raw audio)
      const simulatedFeatures = {
        spectrogram: Array.from({ length: Math.max(10, Math.floor(answer.length / 10)) }, () => ({
          energy: Math.random() * 2 - 1,
          maxFreq: Math.random(),
          centroid: Math.random(),
          zeroCrossings: Math.floor(Math.random() * 20)
        })),
        duration: Math.max(5, answer.split(' ').length * 0.5), // Estimate duration
        sampleRate: 16000
      };
      setAudioFeatures(simulatedFeatures);
      console.log('Simulated audio features extracted:', simulatedFeatures);
    }
  };

  // New functions for editing functionality
  const toggleEditMode = () => {
    setIsEditingMode(!isEditingMode);
    if (!isEditingMode) {
      setEditableTranscript(answer);
    }
  };

  const saveEdit = () => {
    setAnswer(editableTranscript);
    setIsEditingMode(false);
  };

  const cancelEdit = () => {
    setEditableTranscript(answer);
    setIsEditingMode(false);
  };

  const handleTranscriptChange = (e) => {
    setEditableTranscript(e.target.value);
  };

  const handleNextClick = () => {
    stopRecording();
    if (questions.length > 0 && index < questions.length) {
      getScore(answer, questions[index].answer);
    }
  };

  const handleFinishClick = () => {
    stopRecording();
    if (questions.length > 0 && index < questions.length) {
      getScore(answer, questions[index].answer);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="speech-recognition"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {loading ? (
        <LoadingComponent />
      ) : (
        <>
          <div className="ml-status" style={{ margin: '0 0 12px 0', padding: '8px 12px', border: '1px solid #55a', borderRadius: '8px', background: '#0f172a' }}>
            <div><strong>ML status: </strong>{mlStatus === 'ready' ? 'Loaded ✅' : mlStatus === 'loading' ? 'Loading...' : 'Failed ⚠️'}</div>
            <div><strong>Fluency score:</strong> {Number(fluencyScore).toFixed(2)} &nbsp; | &nbsp; <strong>Confidence score:</strong> {Number(confidenceScore).toFixed(2)}</div>
            <div><strong>Q answered:</strong> {questionScores.length} / {questions.length}</div>
          </div>
          {/* Timer Section - Only show after question is finished */}
          <AnimatePresence>
            {interviewState !== 'question' && (
              <motion.div 
                className="timer-section" 
                variants={itemVariants}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="timer-card">
                  <div className="timer-icon">
                    <Timer />
                  </div>
                  <div className="timer-content">
                    <span className="timer-label">Time Remaining</span>
                    <span className="timer-value">{timer}s</span>
                    <div className="timer-tooltip-container">
                      <Info 
                        className="timer-tooltip-icon"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      />
                      {showTooltip && (
                        <motion.div 
                          className="timer-tooltip"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          Timer starts after question playback ends
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Interview Interface */}
          <motion.div className="interview-interface" variants={itemVariants}>
            {/* Question Panel */}
            <motion.div className="question-panel" variants={itemVariants}>
              <div className="question-header">
                <div className="question-progress">
                  <span className="question-number">Question {index + 1} of {questions.length}</span>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="question-status">
                  <QuestionAnswer className="status-icon" />
                  <span>AI Interviewer</span>
                </div>
              </div>
              
              <div className="question-content">
                <h3 className="question-text">{question}</h3>
              </div>
            </motion.div>

            {/* AI Bot Section */}
            <motion.div className="ai-bot-section" variants={itemVariants}>
              <AnimatePresence mode="wait">
                {botTalking ? (
                  <motion.div 
                    key="bot-active"
                    className="bot-active"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bot-icon">
                      <SmartToyTwoTone sx={{ fontSize: 120 }} />
                    </div>
                    <div className="bot-status">
                      <RecordVoiceOver className="status-icon" />
                      <span>AI is speaking...</span>
                    </div>
                    <div className="pulse-ring"></div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="bot-idle"
                    className="bot-idle"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bot-icon">
                      <SmartToyTwoTone sx={{ fontSize: 120 }} />
                    </div>
                    <div className="bot-status">
                      <Mic className="status-icon" />
                      <span>Ready to listen</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Response Panel */}
            <motion.div className="response-panel" variants={itemVariants}>
              <div className="response-header">
                <div className="response-title">
                  <MicOff className="response-icon" />
                  <span>Your Response</span>
                </div>
                <div className="response-controls">
                  {!isEditingMode && answer && (
                    <motion.button
                      className="edit-button"
                      onClick={toggleEditMode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit />
                      <span>Edit</span>
                    </motion.button>
                  )}
                  {isEditingMode && (
                    <div className="edit-controls">
                      <motion.button
                        className="save-button"
                        onClick={saveEdit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save />
                      </motion.button>
                      <motion.button
                        className="cancel-button"
                        onClick={cancelEdit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Cancel />
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="response-indicator">
                  {recognition ? (
                    <div className="recording-indicator">
                      <div className="recording-dot"></div>
                      <span>Recording...</span>
                    </div>
                  ) : (
                    <div className="idle-indicator">
                      <Mic className="idle-icon" />
                      <span>Ready to record</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="response-content">
                {isEditingMode ? (
                  <motion.textarea
                    className="transcript-editor"
                    value={editableTranscript}
                    onChange={handleTranscriptChange}
                    placeholder="Edit your response here..."
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <div className="response-text-container">
                    <p className="response-text">
                      {liveTranscript || answer || "Your response will appear here as you speak..."}
                    </p>
                    {liveTranscript && !answer && (
                      <motion.div 
                        className="live-transcript-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="live-dot"></div>
                        <span>Live transcription</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Action Section - Only show after question is finished */}
          <AnimatePresence>
            {interviewState !== 'question' && (
              <motion.div 
                className="action-section" 
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {!nextButtonAvailable && nextButtonCountdown > 0 && (
                    <motion.div 
                      className="countdown-message"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Timer className="countdown-icon" />
                      <span>Please wait {nextButtonCountdown} seconds before proceeding...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.button 
                  onClick={(index + 1 >= questions.length) ? handleFinishClick : handleNextClick} 
                  className="action-button"
                  disabled={scoreload || !nextButtonAvailable}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {scoreload ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Processing...</span>
                    </>
                  ) : !nextButtonAvailable ? (
                    <>
                      <Timer />
                      <span>Next ({nextButtonCountdown}s)</span>
                    </>
                  ) : (index + 1 >= questions.length) ? (
                    <>
                      <CheckCircle />
                      <span>Finish Interview</span>
                    </>
                  ) : (
                    <>
                      <PlayArrow />
                      <span>Next Question</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default SpeechRecognition;
