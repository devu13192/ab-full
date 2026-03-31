import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Finish.css';
import { UserAuth } from '../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AIFeedback from '../../components/AIFeedback/AIFeedback';
import DetailedFeedbackCard from '../../components/DetailedFeedbackCard/DetailedFeedbackCard';
import OverallPerformanceSummary from '../../components/OverallPerformanceSummary/OverallPerformanceSummary';

const EnhancedFinish = () => {
  const { user } = UserAuth();
  const location = useLocation();
  const { id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const feedback = queryParams.get('feedback') || 'No feedback available';
  const score = parseInt(queryParams.get('score') || '0', 10);
  const rawScores = queryParams.get('scores');
  const questionScoresData = queryParams.get('questionScores'); // New parameter for detailed scores

  const [intDetails, setIntDetails] = useState(null);
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isIntDetailsSet, setIsIntDetailsSet] = useState(false);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState([]);
  const [populatedQuestionScores, setPopulatedQuestionScores] = useState([]);

  // Parse question scores data
  const parsedQuestionScores = (() => {
    try {
      return JSON.parse(decodeURIComponent(questionScoresData || rawScores || '[]')) || [];
    } catch (error) {
      console.error('Error parsing question scores:', error);
      return [];
    }
  })();

  const topicBreakdown = (() => {
    try {
      // Use the detailed question scores for breakdown
      if (parsedQuestionScores.length > 0 && typeof parsedQuestionScores[0] === 'object') {
        // New format: array of question score objects
        const topicMap = {};
        parsedQuestionScores.forEach(q => {
          const topic = intDetails?.type || 'General';
          if (!topicMap[topic]) topicMap[topic] = [];
          topicMap[topic].push(q.score);
        });

        return Object.entries(topicMap).map(([topic, scores]) => ({
          topic,
          avg: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        }));
      } else {
        // Fallback to old format
        const arr = JSON.parse(decodeURIComponent(rawScores || '[]')) || []
        console.log('Raw scores array:', arr);

        const totals = {}
        const counts = {}
        for (const entry of arr) {
          const [t, s] = String(entry).split(':')
          const topic = (t || '').trim()
          const val = Number(String(s || '').replace(/[^0-9]/g, '')) || 0
          // Filter out undefined, empty, or invalid topics
          if (!topic || topic === 'undefined' || topic === 'null' || topic.length === 0) continue
          totals[topic] = (totals[topic] || 0) + val
          counts[topic] = (counts[topic] || 0) + 1
        }

        const breakdown = Object.entries(totals).map(([topic, total]) => ({
          topic,
          avg: Math.round(total / (counts[topic] || 1))
        }))

        console.log('Topic breakdown:', breakdown);
        return breakdown;
      }
    } catch (error) {
      console.error('Error parsing topic breakdown:', error);
      return []
    }
  })()

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await axios.get(`/interview/${id}`);
        setIntDetails(response.data);
        setIsIntDetailsSet(true);
        console.log('Fetched interview details:', response.data);

        // Extract questions and answers from question scores data
        if (parsedQuestionScores.length > 0 && typeof parsedQuestionScores[0] === 'object') {
          const questions = parsedQuestionScores.map(q => q.question);
          const answers = parsedQuestionScores.map(q => q.userAnswer);
          setInterviewQuestions(questions);
          setInterviewAnswers(answers);
          console.log('Extracted questions and answers from question scores:', { questions, answers });
        } else if (response.data.questions) {
          // Fallback to database questions
          setInterviewQuestions(response.data.questions.map(q => q.question || q));
        }
      } catch (error) {
        console.error('Error fetching interview data:', error);
      }
    };

    fetchInterviewData();
  }, [id, parsedQuestionScores]);

  useEffect(() => {
    if (user && isIntDetailsSet && !isUserFetched) {
      const uintData = {
        uid: user.uid,
        company: intDetails.company,
        role: intDetails.role,
        type: intDetails.type,
        score: score,
        feedback: feedback,
      };

      const sendUserInterviewData = async () => {
        try {
          await axios.post(`/userInterview`, uintData);
          setIntDetails((prevState) => ({
            ...prevState,
            sent: true,
          }));
        } catch (error) {
          console.error('Error sending user interview data:', error);
        }
      };

      sendUserInterviewData();
      setIsUserFetched(true);
      
      const updateScore = async () => {
        try {
          await axios.patch(`/user/score/${user.uid}`, score)
        } catch (error) {
          console.log(error);
        }
      }
      updateScore()
    }
  }, [user, intDetails, score, feedback, isIntDetailsSet, isUserFetched]);

  useEffect(() => {
    document.title = 'Summary';
  }, []);

  // Populate question scores with default values when parsedQuestionScores is empty
  useEffect(() => {
    if (parsedQuestionScores.length === 0 && intDetails?.questions && intDetails.questions.length > 0) {
      const defaultScores = intDetails.questions.map((q, index) => ({
        questionIndex: index,
        question: q.question || '',
        userAnswer: '',
        expectedAnswer: q.answer || '',
        score: 0,
        maxScore: 5,
        fluencyScore: 0,
        textConfidence: 0,
        audioConfidence: 0,
        technicalRelevance: 0,
        similarity: 0
      }));
      setPopulatedQuestionScores(defaultScores);
      console.log('Populated question scores with default values:', defaultScores);
    } else if (parsedQuestionScores.length > 0) {
      setPopulatedQuestionScores(parsedQuestionScores);
    }
  }, [parsedQuestionScores, intDetails]);

  const handleGenerateAIFeedback = () => {
    setShowAIFeedback(true);
  };

  return (
    <div className="finish-container">
      <div className="success-container">
        <CheckCircleIcon sx={{ fontSize: 84, color: '#22c55e' }} />
        <h2>Great work! Your interview has been submitted successfully.</h2>
      </div>
      
      <div className="int-evaluation">
        <h1>Evaluation</h1>
        <div className="score">
          <div className="pill">Overall Score: <span style={{marginLeft:8, color:'#ffffff'}}>{score} out of 100</span></div>
          {intDetails && (
            <div className="meta">{intDetails.company} • {intDetails.role} • {intDetails.type || 'Interview'}</div>
          )}
        </div>
        
        {topicBreakdown.length > 0 && (
          <div className="breakdown">
            <h3>Topic-wise Breakdown</h3>
            <ul>
              {topicBreakdown.map((b, idx) => (
                <li key={idx}>
                  <span className="topic-chip">{b.topic}</span>
                  <div className="bar"><span style={{ width: `${Math.min(100, Math.max(0, b.avg))}%` }} /></div>
                  <span className="percent">{b.avg}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="feedback">
          <h2>Feedback</h2>
          <p>{feedback}</p>
        </div>
        {console.log('Parsed question scores for detailed feedback:', populatedQuestionScores)}
        <OverallPerformanceSummary questionScores={populatedQuestionScores} />

        {populatedQuestionScores.length > 0 && (
          <div className="question-details">
            <h3>📊 Detailed Performance Analysis - Question-by-Question Breakdown</h3>
            <div className="detailed-feedback-container">
              {populatedQuestionScores.map((q, idx) => (
                <DetailedFeedbackCard 
                  key={idx}
                  questionData={q}
                  questionIndex={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI-Powered Feedback Section */}
        <div className="ai-feedback-section">
          <div className="ai-feedback-header">
            <h2>🤖 AI-Powered Analysis</h2>
            <p>Get detailed insights and recommendations powered by advanced AI</p>
            {!showAIFeedback && (
              <button 
                className="generate-ai-feedback-btn"
                onClick={handleGenerateAIFeedback}
              >
                Generate AI Feedback
              </button>
            )}
          </div>
          
          {showAIFeedback && (
            <AIFeedback
              interviewId={id}
              questions={interviewQuestions}
              answers={interviewAnswers}
              company={intDetails?.company}
              position={intDetails?.role}
              topics={topicBreakdown.map(t => t.topic)}
            />
          )}
        </div>
      </div>
      
      <div className="go-back">
        <Link className="home-button" to="/home">Home</Link>
      </div>
    </div>
  );
};

export default EnhancedFinish;


