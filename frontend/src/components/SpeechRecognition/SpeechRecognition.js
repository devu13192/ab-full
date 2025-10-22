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

const SpeechRecognition = ({ setBotTalking, botTalking }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [index, setIndex] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [questions, setQuestions] = useState([]);
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

  const getScore = async (sentence1, sentence2) => {
    setScoreload(true);
    const options = {
      method: 'POST',
      body: JSON.stringify({
        message: `compare the following sentences and give similarity score. Sentence 1 - ${sentence1} Sentence 2 - ${sentence2} . Strictly Return only percentage of similarity as an integer of one, two or three digits and avoid any comments that are words in your answer. if any of the sentence is blank , then return 0`,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch('/completions', options);
      const score = await response.text();
      const { type } = questions[index];
      const scoreString = `${type}:${score}`;
      setScores((prevScores) => [...prevScores, scoreString]);
      
      // Update index and check if this was the last question
      const newIndex = index + 1;
      setIndex(newIndex);
      setAnswer('');
      
      // Check if this was the last question (index is now equal to questions.length)
      if (newIndex >= questions.length) {
        // Automatically get feedback when all questions are done
        getFeedback();
      } else {
        // Move to next question
        speak(questions[newIndex].question);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setScoreload(false);
    }
  };

  const getFeedback = async () => {
    setScoreload(true);

    const options = {
        method: 'POST',
        body: JSON.stringify({
            message: `${scores} given is a list of scores obtained on different subjects where key is the subject name. give overall feedback of performance. be specific and avoid unnecessary lines. Take average of scores on repeating keys and dont give the calculation of average score.Strictly avoid printing the line 'Based on the given scores in the dictionary, here is the specific and concise overall feedback on the performance in different subjects:'  or you will be punished. Also give overall performance score out of 100 as the last one,two or three integers in the format 'Overall Performance : score'`,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const options2 = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    try {
        const response = await fetch('/completions', options);
        const feedback = await response.text();
        
        // Try multiple regex patterns to extract the score
        let score = 0;
        const patterns = [
            /Overall Performance:\s*(\d+)/i,
            /Overall Performance\s*:\s*(\d+)/i,
            /Overall Performance\s*(\d+)/i,
            /Performance:\s*(\d+)/i,
            /score\s*(\d+)/i
        ];
        
        for (const pattern of patterns) {
            const match = feedback.match(pattern);
            if (match && match[1]) {
                score = parseInt(match[1]);
                console.log('Extracted score:', score);
                break;
            }
        }
        
        // If no pattern matches, try to find any number at the end of the feedback
        if (score === 0) {
            const numberMatch = feedback.match(/(\d+)(?:\s*$|\s*\.?\s*$)/);
            if (numberMatch && numberMatch[1]) {
                score = parseInt(numberMatch[1]);
                console.log('Fallback score extraction:', score);
            }
        }
        
        if (score === 0) {
            console.log("Unable to extract the overall performance score from:", feedback);
        }

        await fetch(`/interview/${id}`,options2)
        console.log('Final feedback:', feedback);
        console.log('Final score:', score);
        
        const encodedScores = encodeURIComponent(JSON.stringify(scores))
        navigate(`/interview/${id}/finish?feedback=${encodeURIComponent(feedback)}&score=${score}&scores=${encodedScores}`);
    } catch (error) {
        console.log(error);
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
